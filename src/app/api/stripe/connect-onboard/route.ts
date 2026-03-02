import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

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
    let accountId = userData.stripeConnectAccountId;

    // Create Express Connect account if none exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: userData.email,
        metadata: { userId: uid },
        business_profile: {
          name: userData.displayName || undefined,
          product_description: 'Retreat and wellness services on HighVibe Retreats',
        },
      });
      accountId = account.id;

      await db.collection('users').doc(uid).update({
        stripeConnectAccountId: accountId,
      });
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${BASE_URL}/payouts?reauth=1`,
      return_url: `${BASE_URL}/api/stripe/connect-return?userId=${uid}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('[CONNECT_ONBOARD] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create Connect onboarding link' }, { status: 500 });
  }
}
