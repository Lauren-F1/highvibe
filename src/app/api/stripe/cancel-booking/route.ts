import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/cancel-booking
 *
 * Cancels a booking and issues a refund IF the retreat has not yet started.
 * Once the retreat starts, the booking is non-refundable and binding.
 *
 * Body: { bookingId: string }
 */
export async function POST(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const { db, FieldValue } = await getFirebaseAdmin();
    const stripe = getStripe();

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingSnap.data()!;

    // Verify the seeker owns this booking
    if (booking.seekerId !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if booking is in a cancellable state
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: `Cannot cancel a booking with status: ${booking.status}` }, { status: 400 });
    }

    // Check if payout has already been released
    if (booking.payoutStatus === 'released' || booking.payoutStatus === 'partial') {
      return NextResponse.json({ error: 'Funds have already been released to providers. This booking is non-refundable.' }, { status: 400 });
    }

    // Check if retreat has started — once started, booking is non-refundable
    const now = new Date();
    if (booking.retreatStartDate) {
      const retreatStart = new Date(booking.retreatStartDate + 'T00:00:00Z');
      if (now >= retreatStart) {
        return NextResponse.json({
          error: 'This retreat has already started. Once a retreat begins, bookings are non-refundable and the agreement is binding.',
        }, { status: 400 });
      }
    }

    // Issue refund via Stripe
    if (booking.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          reason: 'requested_by_customer',
        });
      } catch (refundError: any) {
        console.error('[CANCEL] Stripe refund failed:', refundError);
        return NextResponse.json({ error: 'Refund failed. Please contact support.' }, { status: 500 });
      }
    }

    // Update booking status
    await bookingRef.update({
      status: 'cancelled',
      payoutStatus: 'refunded',
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: uid,
      refundReason: 'seeker_requested',
    });

    // If a manifest credit was redeemed for this booking, restore it
    if (booking.stripeSessionId) {
      const creditSnap = await db.collection('manifest_credits')
        .where('redemption_booking_id', '==', bookingId)
        .where('status', '==', 'redeemed')
        .limit(1)
        .get();

      if (!creditSnap.empty) {
        await creditSnap.docs[0].ref.update({
          status: 'available',
          redeemed_amount: 0,
          redemption_booking_id: null,
          redeemed_date: null,
        });
      }
    }

    // Decrement capacity on the retreat
    const retreatId = booking.retreatId;
    if (retreatId) {
      try {
        const retreatRef = db.collection('retreats').doc(retreatId);
        await db.runTransaction(async (txn) => {
          const snap = await txn.get(retreatRef);
          if (!snap.exists) return;
          const data = snap.data()!;
          const newAttendees = Math.max(0, (data.currentAttendees || 0) - 1);
          const capacity = data.capacity || 0;
          const spotsRemaining = capacity > 0 ? capacity - newAttendees : 0;
          txn.update(retreatRef, {
            currentAttendees: newAttendees,
            spotsRemaining,
            isFullyBooked: capacity > 0 && spotsRemaining <= 0,
          });
        });

        // Notify waitlisted seekers that a spot opened up
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';
        const waitlistSnap = await db.collection('retreat_interest')
          .where('retreatId', '==', retreatId)
          .get();
        for (const wDoc of waitlistSnap.docs) {
          const wData = wDoc.data();
          fetch(`${baseUrl}/api/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: wData.seekerId,
              type: 'waitlist_spot_open',
              title: 'A spot just opened up!',
              body: `A spot is now available for a retreat you were interested in.`,
              linkUrl: `/retreats/${retreatId}`,
              metadata: { retreatId },
            }),
          }).catch(e => console.error('[CANCEL] Waitlist notification failed:', e));
        }
      } catch (e) {
        console.error('[CANCEL] Capacity update failed:', e);
      }
    }

    console.log(`[CANCEL] Booking ${bookingId} cancelled and refunded by seeker ${uid}`);

    return NextResponse.json({ success: true, message: 'Booking cancelled and refund issued.' });
  } catch (error: any) {
    console.error('[CANCEL] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
