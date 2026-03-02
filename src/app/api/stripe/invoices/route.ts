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

    const customerId = userDoc.data()?.stripeCustomerId;
    if (!customerId) {
      return NextResponse.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 24,
    });

    const formatted = invoices.data.map(inv => ({
      id: inv.id,
      date: new Date(inv.created * 1000).toISOString(),
      amount: (inv.amount_paid || 0) / 100,
      currency: inv.currency,
      status: inv.status,
      description: inv.lines.data[0]?.description || 'Subscription',
      invoicePdf: inv.invoice_pdf,
    }));

    return NextResponse.json({ invoices: formatted });
  } catch (error: any) {
    console.error('[INVOICES] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
