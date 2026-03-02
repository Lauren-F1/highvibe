import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { allRetreats } from '@/lib/mock-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

export async function POST(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const body = await request.json();
    const { retreatId, applyCredit, creditId, liabilityAccepted, medicalDisclosureAccepted } = body;

    if (!retreatId || !liabilityAccepted) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await getFirebaseAdmin();

    // Fetch retreat — try Firestore first, fall back to mock data
    let retreatTitle = '';
    let retreatPrice = 0;
    let retreatProviderId = '';

    const retreatDoc = await db.collection('retreats').doc(retreatId).get();
    if (retreatDoc.exists) {
      const data = retreatDoc.data()!;
      retreatTitle = data.title || 'Retreat';
      retreatPrice = data.costPerPerson || data.price || 0;
      retreatProviderId = data.guideId || data.createdBy || '';
    } else {
      // Fall back to mock data
      const mockRetreat = allRetreats.find(r => r.id === retreatId);
      if (!mockRetreat) {
        return NextResponse.json({ error: 'Retreat not found' }, { status: 404 });
      }
      retreatTitle = mockRetreat.title;
      retreatPrice = mockRetreat.price * 5; // mock package price (matches checkout page)
      retreatProviderId = 'guide-placeholder-id';
    }

    // Handle manifest credit discount
    let discount = 0;
    let validCreditId = '';
    if (applyCredit && creditId) {
      const creditDoc = await db.collection('manifest_credits').doc(creditId).get();
      if (creditDoc.exists) {
        const creditData = creditDoc.data()!;
        if (creditData.seeker_id === uid && creditData.status === 'available') {
          discount = Math.min(creditData.issued_amount || 0, retreatPrice);
          validCreditId = creditId;
        }
      }
    }

    const totalInCents = Math.round((retreatPrice - discount) * 100);
    if (totalInCents <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    // Fetch user email for prefill
    const userDoc = await db.collection('users').doc(uid).get();
    const userEmail = userDoc.exists ? userDoc.data()?.email : undefined;

    // Determine platform fee percentage based on provider's plan and role
    let platformFeePercent = 12.5; // default PAYG guide rate
    let providerConnectAccountId = '';
    if (retreatProviderId && retreatProviderId !== 'guide-placeholder-id') {
      const providerDoc = await db.collection('users').doc(retreatProviderId).get();
      if (providerDoc.exists) {
        const providerData = providerDoc.data()!;
        const plan = providerData.currentPlanKey_guide || 'pay-as-you-go';
        if (plan === 'pro') platformFeePercent = 8;
        else if (plan === 'starter') platformFeePercent = 10;
        // Get Connect account for destination charges
        if (providerData.stripeConnectAccountId && providerData.stripeConnectOnboarded) {
          providerConnectAccountId = providerData.stripeConnectAccountId;
        }
      }
    }

    const stripe = getStripe();

    // Calculate platform fee (application_fee_amount) — this is what HighVibe keeps.
    // Stripe's processing fee is deducted from the provider's portion automatically
    // when using destination charges.
    const applicationFeeInCents = Math.round(totalInCents * (platformFeePercent / 100));

    const sessionParams: any = {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: retreatTitle },
            unit_amount: totalInCents,
          },
          quantity: 1,
        },
      ],
      ...(userEmail ? { customer_email: userEmail } : {}),
      success_url: `${BASE_URL}/checkout/${retreatId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/checkout/${retreatId}`,
      metadata: {
        userId: uid,
        retreatId,
        creditId: validCreditId,
        discount: String(discount),
        retreatPrice: String(retreatPrice),
        platformFeePercent: String(platformFeePercent),
        providerId: retreatProviderId,
        liabilityAccepted: String(liabilityAccepted),
        medicalDisclosureAccepted: String(medicalDisclosureAccepted || false),
        retreatTitle,
      },
      payment_intent_data: {
        metadata: {
          userId: uid,
          retreatId,
          providerId: retreatProviderId,
          bookingSource: 'highvibe',
        },
        // If provider has a connected Stripe account, use destination charges.
        // This routes payment to the provider automatically. HighVibe keeps
        // the application_fee_amount as pure revenue. Stripe's processing fee
        // (2.9% + $0.30) is deducted from the provider's portion, not HighVibe's.
        ...(providerConnectAccountId ? {
          application_fee_amount: applicationFeeInCents,
          transfer_data: {
            destination: providerConnectAccountId,
          },
        } : {}),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[STRIPE_CHECKOUT] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
