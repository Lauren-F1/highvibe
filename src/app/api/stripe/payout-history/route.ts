import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const { db } = await getFirebaseAdmin();
    const stripe = getStripe();

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const accountId = userDoc.data()?.stripeConnectAccountId;
    if (!accountId) {
      return NextResponse.json({ transfers: [] });
    }

    const transfers = await stripe.transfers.list({
      destination: accountId,
      limit: 20,
    });

    const formatted = transfers.data.map(t => ({
      id: t.id,
      amount: t.amount / 100,
      currency: t.currency,
      created: new Date(t.created * 1000).toISOString(),
      description: t.description || 'Retreat booking payout',
      metadata: t.metadata,
    }));

    return NextResponse.json({ transfers: formatted });
  } catch (error: any) {
    console.error('[PAYOUT_HISTORY] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch payout history' }, { status: 500 });
  }
}
