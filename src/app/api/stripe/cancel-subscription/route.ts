import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const { db } = await getFirebaseAdmin();
    const stripe = getStripe();

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const subId = userData.stripeSubscriptionId;

    if (!subId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    // Schedule cancellation at period end (graceful downgrade)
    const updated = await stripe.subscriptions.update(subId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      status: updated.status,
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      currentPeriodEnd: new Date((updated as any).current_period_end * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('[CANCEL_SUBSCRIPTION] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
