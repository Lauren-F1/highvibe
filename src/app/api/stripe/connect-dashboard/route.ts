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

    const accountId = userDoc.data()?.stripeConnectAccountId;
    if (!accountId) {
      return NextResponse.json({ error: 'No Connect account found' }, { status: 400 });
    }

    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return NextResponse.json({ url: loginLink.url });
  } catch (error: any) {
    console.error('[CONNECT_DASHBOARD] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create dashboard link' }, { status: 500 });
  }
}
