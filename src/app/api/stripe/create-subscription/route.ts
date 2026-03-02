import { NextResponse } from 'next/server';
import { getStripe, getPriceId } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const body = await request.json();
    const { role, planKey } = body;

    if (!role || !planKey || !['guide', 'host', 'vendor'].includes(role) || !['starter', 'pro'].includes(planKey)) {
      return NextResponse.json({ error: 'Invalid role or plan' }, { status: 400 });
    }

    const { db } = await getFirebaseAdmin();
    const stripe = getStripe();

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    let customerId = userData.stripeCustomerId;

    // Create Stripe Customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.displayName || undefined,
        metadata: { userId: uid },
      });
      customerId = customer.id;
      await db.collection('users').doc(uid).update({ stripeCustomerId: customerId });
    }

    const priceId = getPriceId(role as 'guide' | 'host' | 'vendor', planKey as 'starter' | 'pro');

    // Check for Pro reactivation fee (downgraded within 60 days)
    if (planKey === 'pro') {
      const lastDowngraded = userData[`proLastDowngradedAt_${role}`];
      if (lastDowngraded) {
        const downgradeDate = lastDowngraded.toDate ? lastDowngraded.toDate() : new Date(lastDowngraded);
        const daysSince = (Date.now() - downgradeDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince <= 60) {
          const reactivationPriceId = process.env.STRIPE_PRICE_PRO_REACTIVATION_FEE;
          if (reactivationPriceId) {
            await stripe.invoiceItems.create({
              customer: customerId,
              price: reactivationPriceId,
              description: 'Pro Plan Reactivation Fee',
            });
          }
        }
      }
    }

    // Check for existing active subscription
    const existingSubId = userData.stripeSubscriptionId;
    if (existingSubId) {
      try {
        const existingSub = await stripe.subscriptions.retrieve(existingSubId);
        if (existingSub.status === 'active' || existingSub.status === 'trialing') {
          // Update existing subscription
          const updated = await stripe.subscriptions.update(existingSubId, {
            items: [{
              id: existingSub.items.data[0].id,
              price: priceId,
            }],
            proration_behavior: 'always_invoice',
            metadata: { userId: uid, role },
          });
          return NextResponse.json({ subscriptionId: updated.id, status: updated.status });
        }
      } catch (e) {
        // Subscription might not exist anymore, create new
      }
    }

    // Create new subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: { userId: uid, role },
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // If payment is incomplete, return client secret for confirmation
    const invoice = subscription.latest_invoice as any;
    if (invoice?.payment_intent?.client_secret) {
      return NextResponse.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: invoice.payment_intent.client_secret,
      });
    }

    return NextResponse.json({ subscriptionId: subscription.id, status: subscription.status });
  } catch (error: any) {
    console.error('[CREATE_SUBSCRIPTION] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create subscription' }, { status: 500 });
  }
}
