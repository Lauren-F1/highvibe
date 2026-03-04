import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/release-payouts
 *
 * Releases held funds to providers for bookings whose retreat has started + 24 hours.
 * Once the retreat starts, the booking becomes non-refundable and binding.
 *
 * This endpoint should be called periodically (e.g., daily cron job) or by an admin.
 * Protected by a secret key in the Authorization header.
 */
export async function POST(request: Request) {
  // Verify cron/admin secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db, FieldValue } = await getFirebaseAdmin();
  const stripe = getStripe();
  const now = new Date();

  try {
    // Find all bookings that are confirmed, held, and eligible for payout
    const eligibleBookings = await db.collection('bookings')
      .where('status', '==', 'confirmed')
      .where('payoutStatus', '==', 'held')
      .where('payoutEligibleAt', '<=', now)
      .limit(50) // Process in batches
      .get();

    if (eligibleBookings.empty) {
      return NextResponse.json({ message: 'No payouts to release', processed: 0 });
    }

    let processed = 0;
    let failed = 0;
    const results: { bookingId: string; status: string; transfers: number }[] = [];

    for (const bookingDoc of eligibleBookings.docs) {
      const booking = bookingDoc.data();
      const bookingId = bookingDoc.id;

      // Get providers from booking
      const providers: { id: string; role: string; amount: number; feePercent: number; label: string }[] = booking.providers || [];

      // If no providers stored, fall back to lineItems
      if (providers.length === 0 && booking.lineItems) {
        for (const item of booking.lineItems) {
          providers.push({
            id: item.providerId,
            role: item.providerRole || 'guide',
            amount: item.amount,
            feePercent: item.platformFeePctApplied || 12.5,
            label: item.description || '',
          });
        }
      }

      let transferCount = 0;
      let hasFailure = false;

      for (const provider of providers) {
        if (!provider.id || provider.id === 'guide-placeholder-id') continue;

        try {
          const providerDoc = await db.collection('users').doc(provider.id).get();
          if (!providerDoc.exists) continue;

          const providerData = providerDoc.data()!;
          if (!providerData.stripeConnectAccountId || !providerData.stripeConnectOnboarded) {
            console.log(`[RELEASE] Provider ${provider.id} (${provider.role}) — no Stripe Connect, skipping`);
            continue;
          }

          const feeAmount = provider.amount * (provider.feePercent / 100);
          let transferAmountCents = Math.round((provider.amount - feeAmount) * 100);
          if (transferAmountCents <= 0) continue;

          // Check for undeducted chargebacks against this provider
          const lostChargebacks = await db.collection('bookings')
            .where('bookedEntityOwnerId', '==', provider.id)
            .where('chargebackStatus', '==', 'lost')
            .where('chargebackDeducted', '==', false)
            .limit(5)
            .get();

          let chargebackDeduction = 0;
          const deductedBookingIds: string[] = [];
          for (const cbDoc of lostChargebacks.docs) {
            const cbData = cbDoc.data();
            const cbAmount = Math.round((cbData.totalAmount || 0) * 100);
            if (cbAmount > 0 && transferAmountCents > 0) {
              const deduction = Math.min(cbAmount, transferAmountCents);
              transferAmountCents -= deduction;
              chargebackDeduction += deduction;
              deductedBookingIds.push(cbDoc.id);
            }
          }

          if (chargebackDeduction > 0) {
            console.log(`[RELEASE] Deducted $${(chargebackDeduction / 100).toFixed(2)} from ${provider.role} ${provider.id} for chargeback offset`);
            // Mark chargebacks as deducted
            for (const cbId of deductedBookingIds) {
              await db.collection('bookings').doc(cbId).update({
                chargebackDeducted: true,
                chargebackDeductedFromBookingId: bookingId,
              });
            }
          }

          if (transferAmountCents <= 0) {
            console.log(`[RELEASE] Transfer to ${provider.role} ${provider.id} fully offset by chargebacks`);
            continue;
          }

          await stripe.transfers.create({
            amount: transferAmountCents,
            currency: 'usd',
            destination: providerData.stripeConnectAccountId,
            metadata: {
              bookingId,
              retreatId: booking.retreatId,
              providerRole: provider.role,
              ...(chargebackDeduction > 0 ? { chargebackDeduction: String(chargebackDeduction) } : {}),
            },
          });

          console.log(`[RELEASE] Transfer: $${(transferAmountCents / 100).toFixed(2)} to ${provider.role} ${provider.id}`);
          transferCount++;
        } catch (transferError) {
          console.error(`[RELEASE] Transfer to ${provider.role} ${provider.id} failed:`, transferError);
          hasFailure = true;
        }
      }

      // Update booking payout status
      const newPayoutStatus = hasFailure ? 'partial' : (transferCount > 0 ? 'released' : 'no_transfers');
      await bookingDoc.ref.update({
        payoutStatus: newPayoutStatus,
        payoutReleasedAt: FieldValue.serverTimestamp(),
        payoutTransferCount: transferCount,
        status: 'completed',
      });

      processed++;
      if (hasFailure) failed++;
      results.push({ bookingId, status: newPayoutStatus, transfers: transferCount });
    }

    console.log(`[RELEASE] Processed ${processed} bookings, ${failed} with partial failures`);

    return NextResponse.json({
      message: `Released payouts for ${processed} bookings`,
      processed,
      failed,
      results,
    });
  } catch (error) {
    console.error('[RELEASE] Error releasing payouts:', error);
    return NextResponse.json({ error: 'Failed to release payouts' }, { status: 500 });
  }
}
