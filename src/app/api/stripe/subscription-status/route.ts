import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const { db } = await getFirebaseAdmin();

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = userDoc.data()!;

    return NextResponse.json({
      stripeCustomerId: data.stripeCustomerId || null,
      stripeSubscriptionId: data.stripeSubscriptionId || null,
      subscriptionStatus: data.subscriptionStatus || null,
      currentPeriodEnd: data.currentPeriodEnd ? (data.currentPeriodEnd.toDate ? data.currentPeriodEnd.toDate().toISOString() : data.currentPeriodEnd) : null,
      currentPlanKey_guide: data.currentPlanKey_guide || 'pay-as-you-go',
      currentPlanKey_host: data.currentPlanKey_host || 'pay-as-you-go',
      currentPlanKey_vendor: data.currentPlanKey_vendor || 'pay-as-you-go',
      stripeConnectAccountId: data.stripeConnectAccountId || null,
      stripeConnectOnboarded: data.stripeConnectOnboarded || false,
    });
  } catch (error: any) {
    console.error('[SUBSCRIPTION_STATUS] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch subscription status' }, { status: 500 });
  }
}
