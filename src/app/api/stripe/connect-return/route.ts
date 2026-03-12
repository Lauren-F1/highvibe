import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.redirect(`${BASE_URL}/payouts?error=missing_user`);
    }

    const { db } = await getFirebaseAdmin();
    const stripe = getStripe();

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.redirect(`${BASE_URL}/payouts?error=user_not_found`);
    }

    const accountId = userDoc.data()?.stripeConnectAccountId;
    if (!accountId) {
      return NextResponse.redirect(`${BASE_URL}/payouts?error=no_account`);
    }

    // Verify the Stripe Connect account actually belongs to this user
    const account = await stripe.accounts.retrieve(accountId);
    if (account.metadata?.userId !== userId) {
      console.error(`[CONNECT_RETURN] userId mismatch: query=${userId}, metadata=${account.metadata?.userId}`);
      return NextResponse.redirect(`${BASE_URL}/payouts?error=unauthorized`);
    }

    // Check account status
    if (account.charges_enabled && account.payouts_enabled) {
      await db.collection('users').doc(userId).update({
        stripeConnectOnboarded: true,
      });
      return NextResponse.redirect(`${BASE_URL}/payouts?connected=1`);
    }

    return NextResponse.redirect(`${BASE_URL}/payouts?pending=1`);
  } catch (error) {
    console.error('[CONNECT_RETURN] Error:', error);
    return NextResponse.redirect(`${BASE_URL}/payouts?error=unknown`);
  }
}
