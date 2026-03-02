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

    const customerId = userDoc.data()?.stripeCustomerId;
    if (!customerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${BASE_URL}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[BILLING_PORTAL] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
