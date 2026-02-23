
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';
import { buildChargebackNotificationEmail } from '@/lib/chargeback-email-templates';
import { format, add } from 'date-fns';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// IMPORTANT: This is a placeholder webhook. In a real application, you must:
// 1. Secure this endpoint to verify that requests are coming from Stripe.
//    - See: https://stripe.com/docs/webhooks/signatures
// 2. Deploy this endpoint and add it to your Stripe Dashboard's webhook settings.
//    - It should listen for the 'charge.dispute.created' event.

export async function POST(request: Request) {
  try {
    // In a real implementation, you would parse the Stripe event here.
    // const stripeEvent = await request.json();
    
    // For this placeholder, we will use mock data.
    const mockStripeDispute = {
      id: 'dp_1Ptesttesttest',
      amount: 250000, // in cents
      currency: 'usd',
      charge: 'ch_1Ptesttesttest',
      // In a real scenario, you'd get the bookingId from the charge's metadata.
      metadata: {
        bookingId: 'bk_1a2b3c',
      },
      evidence_details: {
        due_by: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
      }
    };
    
    // console.log(`Received Stripe Webhook: ${stripeEvent.type}`);

    // if (stripeEvent.type === 'charge.dispute.created') {
    //   const dispute = stripeEvent.data.object;
    //   const bookingId = dispute.metadata.bookingId;
    
    const bookingId = mockStripeDispute.metadata.bookingId;
    if (!bookingId) {
        console.error('Webhook received without bookingId in metadata.');
        return NextResponse.json({ ok: false, error: "Missing bookingId in metadata" }, { status: 400 });
    }

    const { db } = await getFirebaseAdmin();
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
        console.error(`Booking with ID ${bookingId} not found for chargeback.`);
        return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    const bookingData = bookingSnap.data();
    if (!bookingData) throw new Error("Booking data is undefined.");

    // Update the booking in Firestore
    await bookingRef.update({
        chargebackStatus: 'open',
        chargebackStripeDisputeId: mockStripeDispute.id
    });
    console.log(`Marked booking ${bookingId} with chargeback status: open`);

    // Notify the provider
    const providerId = bookingData.lineItems[0]?.providerId;
    if (providerId) {
        const providerSnap = await db.collection('users').doc(providerId).get();
        if (providerSnap.exists()) {
            const providerData = providerSnap.data();
            if (providerData && providerData.email) {
                
                await sendEmail(buildChargebackNotificationEmail({
                    providerName: providerData.displayName,
                    bookingId: bookingId,
                    amount: mockStripeDispute.amount / 100,
                    currency: mockStripeDispute.currency.toUpperCase(),
                    evidenceDeadline: format(new Date(mockStripeDispute.evidence_details.due_by * 1000), 'PPP'),
                }));
                console.log(`Sent chargeback notification to provider: ${providerData.email}`);
            }
        }
    }
    
    // } // end of if (stripeEvent.type === ...)

    return NextResponse.json({ ok: true, message: 'Webhook processed successfully (placeholder)' });

  } catch (error: any) {
    console.error("STRIPE_WEBHOOK_ERROR", error);
    return NextResponse.json({ 
        ok: false,
        error: 'An unexpected error occurred processing the webhook.',
    }, { status: 500 });
  }
}
