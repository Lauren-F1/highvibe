import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';
import { buildChargebackNotificationEmail } from '@/lib/chargeback-email-templates';
import { format } from 'date-fns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('[WEBHOOK] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const { db, FieldValue } = await getFirebaseAdmin();

  try {
    switch (event.type) {
      // --- Checkout / Payments ---
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, db, FieldValue, stripe);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, db);
        break;

      // --- Connect ---
      case 'account.updated':
        await handleConnectAccountUpdated(event.data.object as Stripe.Account, db);
        break;

      // --- Subscriptions ---
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, db);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, db);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoiceSucceeded(event.data.object as Stripe.Invoice, db, FieldValue);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, db);
        break;

      // --- Payout / Transfer Failures ---
      case 'transfer.reversed':
        await handleTransferFailed(event.data.object as Stripe.Transfer, db);
        break;
      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout, db);
        break;

      // --- Disputes ---
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute, db);
        break;
      case 'charge.dispute.updated':
      case 'charge.dispute.closed':
        await handleDisputeStatusChange(event.data.object as Stripe.Dispute, db);
        break;

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[WEBHOOK] Error handling ${event.type}:`, error);
    // Return 200 to prevent Stripe retries on application errors
  }

  return NextResponse.json({ received: true });
}

// --- Checkout Handlers ---

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  db: FirebaseFirestore.Firestore,
  FieldValue: typeof import('firebase-admin').firestore.FieldValue,
  stripe: Stripe,
) {
  const meta = session.metadata || {};
  const { userId, retreatId, creditId, discount, retreatPrice, platformFeePercent, providerId, liabilityAccepted, medicalDisclosureAccepted, retreatTitle } = meta;

  if (!userId || !retreatId) {
    console.error('[WEBHOOK] checkout.session.completed missing userId or retreatId in metadata');
    return;
  }

  // Idempotency: check if booking already exists for this session
  const existingBooking = await db.collection('bookings')
    .where('stripeSessionId', '==', session.id)
    .limit(1)
    .get();
  if (!existingBooking.empty) {
    console.log(`[WEBHOOK] Booking already exists for session ${session.id}, skipping`);
    return;
  }

  const totalAmount = (session.amount_total || 0) / 100;

  // Parse multi-provider info
  let providers: { id: string; role: string; amount: number; feePercent: number; label: string }[] = [];
  try {
    providers = JSON.parse(meta.providers || '[]');
  } catch { providers = []; }

  const isMultiProvider = meta.isMultiProvider === 'true' && providers.length > 1;

  // Calculate fees
  let totalPlatformFee = 0;
  const bookingLineItems: Record<string, unknown>[] = [];

  if (isMultiProvider) {
    for (const p of providers) {
      const fee = Math.round(p.amount * (p.feePercent / 100) * 100) / 100;
      totalPlatformFee += fee;
      bookingLineItems.push({
        providerId: p.id,
        providerRole: p.role,
        description: p.label,
        amount: p.amount,
        platformFeePctApplied: p.feePercent,
        platformFeeAmount: fee,
      });
    }
  } else {
    const feePercent = parseFloat(platformFeePercent || '12.5');
    totalPlatformFee = Math.round(totalAmount * (feePercent / 100) * 100) / 100;
    bookingLineItems.push({
      providerId: providerId || '',
      providerRole: 'guide',
      description: retreatTitle || 'Retreat Booking',
      amount: parseFloat(retreatPrice || String(totalAmount)),
      platformFeePctApplied: feePercent,
      platformFeeAmount: totalPlatformFee,
    });
  }

  const paymentIntentId = session.payment_intent as string || '';
  let stripeProcessingFee = 0;

  if (paymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.latest_charge) {
        const charge = await stripe.charges.retrieve(pi.latest_charge as string, {
          expand: ['balance_transaction'],
        });
        const bt = charge.balance_transaction as Stripe.BalanceTransaction;
        if (bt?.fee) {
          stripeProcessingFee = bt.fee / 100;
        }
      }
    } catch (e) {
      console.error('[WEBHOOK] Error retrieving payment intent details:', e);
    }
  }

  // Look up retreat start date for payout scheduling
  let retreatStartDate: string | null = null;
  let payoutEligibleAt: Date | null = null;
  try {
    const retreatDoc = await db.collection('retreats').doc(retreatId).get();
    if (retreatDoc.exists) {
      retreatStartDate = retreatDoc.data()?.startDate || null;
      if (retreatStartDate) {
        // Payout eligible 24 hours after retreat start date
        const startDate = new Date(retreatStartDate + 'T00:00:00Z');
        payoutEligibleAt = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      }
    }
  } catch (e) {
    console.error('[WEBHOOK] Error fetching retreat start date:', e);
  }

  const batch = db.batch();

  // Create booking — funds are HELD until retreat starts + 24 hours
  const bookingRef = db.collection('bookings').doc();
  batch.set(bookingRef, {
    seekerId: userId,
    bookedEntityOwnerId: providerId || '',
    retreatId,
    status: 'confirmed',
    totalAmount,
    currency: 'usd',
    platformFeeAmount: totalPlatformFee,
    stripeProcessingFee,
    paymentModel: 'held_then_transfer',
    payoutStatus: 'held',
    payoutEligibleAt: payoutEligibleAt || null,
    retreatStartDate: retreatStartDate || null,
    refundableUntil: retreatStartDate ? new Date(retreatStartDate + 'T00:00:00Z') : null,
    stripePaymentIntentId: paymentIntentId,
    stripeSessionId: session.id,
    manifestationId: null,
    lineItems: bookingLineItems,
    providers: providers,
    liabilityWaiverAccepted: liabilityAccepted === 'true',
    liabilityWaiverAcceptedAt: FieldValue.serverTimestamp(),
    liabilityWaiverVersion: 'v1.0-02-01-2026',
    medicalDisclosureAccepted: medicalDisclosureAccepted === 'true',
    createdAt: FieldValue.serverTimestamp(),
  });

  // Create transaction record
  const txnRef = bookingRef.collection('transactions').doc();
  batch.set(txnRef, {
    bookingId: bookingRef.id,
    paymentGatewayTransactionId: session.payment_intent as string || '',
    amount: totalAmount,
    currency: 'usd',
    type: 'payment',
    status: 'successful',
    createdAt: FieldValue.serverTimestamp(),
  });

  // Redeem manifest credit if used
  if (creditId) {
    const creditRef = db.collection('manifest_credits').doc(creditId);
    batch.update(creditRef, {
      status: 'redeemed',
      redeemed_amount: parseFloat(discount || '0'),
      redemption_booking_id: bookingRef.id,
      redeemed_date: FieldValue.serverTimestamp(),
    });
  }

  // Issue manifest credit to seeker (3% of total, capped at $500)
  const creditPercent = 0.03;
  const creditCap = 500;
  const creditAmount = Math.min(Math.round(totalAmount * creditPercent * 100) / 100, creditCap);
  if (creditAmount > 0) {
    const creditRef = db.collection('manifest_credits').doc();
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + 365);
    batch.set(creditRef, {
      seeker_id: userId,
      booking_id: bookingRef.id,
      issued_amount: creditAmount,
      currency: 'usd',
      issue_date: now,
      expiry_date: expiryDate,
      status: 'available',
    });
  }

  await batch.commit();
  console.log(`[WEBHOOK] Created booking ${bookingRef.id} for session ${session.id} (credit: $${creditAmount}, providers: ${providers.length})`);

  // --- Capacity tracking + publish-on-first-booking ---
  const quantity = parseInt(meta.quantity || '1', 10) || 1;
  let justPublished = false;
  try {
    const retreatRef = db.collection('retreats').doc(retreatId);
    await db.runTransaction(async (txn) => {
      const snap = await txn.get(retreatRef);
      if (!snap.exists) return;
      const data = snap.data()!;
      const newAttendees = (data.currentAttendees || 0) + quantity;
      const capacity = data.capacity || 0;
      const spotsRemaining = Math.max(0, capacity > 0 ? capacity - newAttendees : 0);
      const updates: Record<string, any> = {
        currentAttendees: newAttendees,
        spotsRemaining,
        isFullyBooked: capacity > 0 && spotsRemaining <= 0,
      };
      if (data.status === 'pending_payment') {
        updates.status = 'published';
        updates.publishedAt = FieldValue.serverTimestamp();
        justPublished = true;
      }
      txn.update(retreatRef, updates);
    });
    console.log(`[WEBHOOK] Retreat ${retreatId}: +${quantity} attendees${justPublished ? ', now published' : ''}`);

    // Fire-and-forget: trigger reverse matching when retreat just published
    if (justPublished) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com'}/api/match-retreat-to-seekers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CRON_SECRET || ''}` },
        body: JSON.stringify({ retreatId }),
      }).catch(e => console.error('[WEBHOOK] Reverse match trigger failed:', e));
    }

    // Notify guide when retreat is fully booked
    const retreatSnap = await db.collection('retreats').doc(retreatId).get();
    const retreatData = retreatSnap.exists ? retreatSnap.data()! : null;
    if (retreatData?.isFullyBooked) {
      const guideId = retreatData.guideId || retreatData.createdBy;
      if (guideId) {
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com'}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: guideId,
            type: 'retreat_fully_booked',
            title: 'Your retreat is fully booked!',
            body: `"${retreatData.title || 'Your retreat'}" has reached full capacity. Consider creating another session if there's more interest.`,
            linkUrl: '/guide',
            metadata: { retreatId, retreatTitle: retreatData.title },
          }),
        }).catch(e => console.error('[WEBHOOK] Fully-booked notification failed:', e));
      }
    }
  } catch (e) {
    console.error('[WEBHOOK] Capacity update failed:', e);
  }

  // Fire-and-forget: send booking confirmation notification
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';
  fetch(`${baseUrl}/api/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      type: 'booking_confirmation',
      title: 'Booking Confirmed!',
      body: `Your booking for ${retreatTitle || 'a retreat'} has been confirmed.`,
      linkUrl: '/seeker/manifestations',
      metadata: { retreatTitle, amount: totalAmount, bookingId: bookingRef.id },
    }),
  }).catch(e => console.error('[WEBHOOK] Notification send failed:', e));

  // Funds are HELD — no transfers at booking time.
  // Payouts are released 24 hours after the retreat start date via /api/stripe/release-payouts.
  // Before the retreat starts, seekers can request a refund (cancellation policy applies).
  // Once the retreat starts, the booking becomes non-refundable and binding.
  if (payoutEligibleAt) {
    console.log(`[WEBHOOK] Funds held. Payout eligible at ${payoutEligibleAt.toISOString()} (24h after retreat start)`);
  } else {
    console.log(`[WEBHOOK] Funds held. No retreat start date found — payouts must be released manually`);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, db: FirebaseFirestore.Firestore) {
  const meta = paymentIntent.metadata || {};
  console.log(`[WEBHOOK] Payment failed for intent ${paymentIntent.id}`, meta);
  // Payment failures before checkout completion don't create bookings,
  // so there's nothing to update. Stripe will show the error to the user.
}

// --- Connect Handlers ---

async function handleConnectAccountUpdated(account: Stripe.Account, db: FirebaseFirestore.Firestore) {
  const userId = account.metadata?.userId;
  if (!userId) return;

  const chargesEnabled = account.charges_enabled;
  const payoutsEnabled = account.payouts_enabled;

  if (chargesEnabled && payoutsEnabled) {
    await db.collection('users').doc(userId).update({
      stripeConnectOnboarded: true,
    });
    console.log(`[WEBHOOK] Connect account verified for user ${userId}`);
  }
}

// --- Subscription Handlers ---

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, db: FirebaseFirestore.Firestore) {
  const customerId = subscription.customer as string;
  const userSnap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  if (userSnap.empty) {
    console.error(`[WEBHOOK] No user found for Stripe customer ${customerId}`);
    return;
  }

  const userDoc = userSnap.docs[0];
  const priceId = subscription.items.data[0]?.price?.id;
  const { role, planKey } = resolvePlanFromPriceId(priceId);

  if (role && planKey) {
    const updates: Record<string, any> = {
      [`currentPlanKey_${role}`]: planKey,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    };

    if (planKey === 'pro') {
      updates[`proCommitmentStartedAt_${role}`] = new Date();
    }

    await userDoc.ref.update(updates);
    console.log(`[WEBHOOK] Updated ${userDoc.id} plan: ${role} → ${planKey}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: FirebaseFirestore.Firestore) {
  const customerId = subscription.customer as string;
  const userSnap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  if (userSnap.empty) return;

  const userDoc = userSnap.docs[0];
  const priceId = subscription.items.data[0]?.price?.id;
  const { role } = resolvePlanFromPriceId(priceId);

  if (role) {
    await userDoc.ref.update({
      [`currentPlanKey_${role}`]: 'pay-as-you-go',
      [`proLastDowngradedAt_${role}`]: new Date(),
      subscriptionStatus: 'canceled',
    });
    console.log(`[WEBHOOK] Subscription canceled for ${userDoc.id}, role ${role} → pay-as-you-go`);
  }
}

async function handleInvoiceSucceeded(
  invoice: Stripe.Invoice,
  db: FirebaseFirestore.Firestore,
  FieldValue: typeof import('firebase-admin').firestore.FieldValue,
) {
  // Log subscription invoice payments — these are for plan billing, not retreat bookings
  const customerId = invoice.customer as string;
  if (!customerId) return;

  console.log(`[WEBHOOK] Invoice ${invoice.id} paid: $${(invoice.amount_paid || 0) / 100}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, db: FirebaseFirestore.Firestore) {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  const userSnap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  if (userSnap.empty) return;

  const userData = userSnap.docs[0].data();
  console.error(`[WEBHOOK] Invoice payment failed for user ${userData.email || userSnap.docs[0].id}`);

  // Update subscription status
  await userSnap.docs[0].ref.update({ subscriptionStatus: 'past_due' });

  // Send payment failure email
  if (userData.email) {
    try {
      await sendEmail({
        to: userData.email,
        subject: 'Payment Failed - Action Required',
        html: `<p>Hi ${userData.displayName || 'there'},</p><p>Your subscription payment failed. Please update your payment method to continue your plan.</p><p>— The HighVibe Team</p>`,
        text: `Hi ${userData.displayName || 'there'},\n\nYour subscription payment failed. Please update your payment method.\n\n— The HighVibe Team`,
      });
    } catch (e) {
      console.error('[WEBHOOK] Failed to send payment failure email:', e);
    }
  }
}

// --- Dispute Handlers ---

async function handleDisputeCreated(dispute: Stripe.Dispute, db: FirebaseFirestore.Firestore) {
  const charge = dispute.charge as string;
  // Get booking from charge metadata — we stored it on the payment intent
  const bookingId = (dispute.metadata as any)?.bookingId || (dispute as any).metadata?.bookingId;

  // If bookingId not in dispute metadata, try to find by charge
  let targetBookingId = bookingId;
  if (!targetBookingId) {
    const bookingSnap = await db.collection('bookings')
      .where('stripePaymentIntentId', '==', dispute.payment_intent as string)
      .limit(1)
      .get();
    if (!bookingSnap.empty) {
      targetBookingId = bookingSnap.docs[0].id;
    }
  }

  if (!targetBookingId) {
    console.error(`[WEBHOOK] Dispute ${dispute.id} — could not find associated booking`);
    return;
  }

  const bookingRef = db.collection('bookings').doc(targetBookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) return;

  await bookingRef.update({
    chargebackStatus: 'open',
    chargebackStripeDisputeId: dispute.id,
  });

  // Notify provider
  const bookingData = bookingSnap.data()!;
  const providerId = bookingData.lineItems?.[0]?.providerId;
  if (providerId) {
    const providerSnap = await db.collection('users').doc(providerId).get();
    if (providerSnap.exists) {
      const providerData = providerSnap.data()!;
      if (providerData.email) {
        const dueBy = dispute.evidence_details?.due_by;
        const chargebackEmail = buildChargebackNotificationEmail({
          providerName: providerData.displayName || 'Provider',
          bookingId: targetBookingId,
          amount: dispute.amount / 100,
          currency: (dispute.currency || 'usd').toUpperCase(),
          evidenceDeadline: dueBy ? format(new Date(dueBy * 1000), 'PPP') : 'TBD',
        });
        await sendEmail({ to: providerData.email, ...chargebackEmail });
      }
    }
  }
}

async function handleDisputeStatusChange(dispute: Stripe.Dispute, db: FirebaseFirestore.Firestore) {
  const bookingSnap = await db.collection('bookings')
    .where('chargebackStripeDisputeId', '==', dispute.id)
    .limit(1)
    .get();

  if (bookingSnap.empty) return;

  const status = dispute.status === 'won' ? 'won' : dispute.status === 'lost' ? 'lost' : 'open';
  await bookingSnap.docs[0].ref.update({ chargebackStatus: status });
  console.log(`[WEBHOOK] Dispute ${dispute.id} status updated to ${status}`);
}

// --- Payout / Transfer Failure Handlers ---

async function handleTransferFailed(transfer: Stripe.Transfer, db: FirebaseFirestore.Firestore) {
  const bookingId = transfer.metadata?.bookingId;
  const retreatId = transfer.metadata?.retreatId;
  const destinationAccount = transfer.destination as string;

  console.error(`[WEBHOOK] Transfer ${transfer.id} failed to ${destinationAccount} ($${(transfer.amount || 0) / 100})`);

  // Update booking with payout failure status
  if (bookingId) {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (bookingSnap.exists) {
      await bookingRef.update({
        payoutStatus: 'failed',
        payoutFailedAt: new Date(),
        payoutFailureTransferId: transfer.id,
      });
    }
  }

  // Find and notify the provider
  if (destinationAccount) {
    const userSnap = await db.collection('users')
      .where('stripeConnectAccountId', '==', destinationAccount)
      .limit(1)
      .get();

    if (!userSnap.empty) {
      const userData = userSnap.docs[0].data();
      if (userData.email) {
        try {
          await sendEmail({
            to: userData.email,
            subject: 'Payout Failed - Action Required',
            html: `<p>Hi ${userData.displayName || 'there'},</p><p>A payout of $${(transfer.amount || 0) / 100} to your connected Stripe account could not be completed. This is typically caused by an issue with your bank account or Stripe account setup.</p><p>Please log in to your <a href="https://highviberetreats.com/payouts">Payouts page</a> and check your Stripe account settings. If the issue persists, contact us at support@highviberetreats.com.</p><p>— The HighVibe Team</p>`,
            text: `Hi ${userData.displayName || 'there'},\n\nA payout of $${(transfer.amount || 0) / 100} to your Stripe account failed. Please check your Stripe settings at https://highviberetreats.com/payouts\n\n— The HighVibe Team`,
          });
        } catch (e) {
          console.error('[WEBHOOK] Failed to send payout failure email:', e);
        }
      }
    }
  }
}

async function handlePayoutFailed(payout: Stripe.Payout, db: FirebaseFirestore.Firestore) {
  // This fires when Stripe can't send funds to a Connect account's bank
  const failureMessage = payout.failure_message || 'Unknown failure';
  console.error(`[WEBHOOK] Payout ${payout.id} failed: ${failureMessage} ($${(payout.amount || 0) / 100})`);

  // Log it — the destination is on the Connect account level, not directly available here.
  // The provider will see the failure in their Stripe Express dashboard.
  // We could also store this in a platform-level audit log if needed.
}

// --- Helpers ---

function resolvePlanFromPriceId(priceId: string | undefined): { role: string | null; planKey: string | null } {
  if (!priceId) return { role: null, planKey: null };

  const mapping: Record<string, { role: string; planKey: string }> = {};
  const envPairs = [
    ['STRIPE_PRICE_GUIDE_STARTER', 'guide', 'starter'],
    ['STRIPE_PRICE_GUIDE_PRO', 'guide', 'pro'],
    ['STRIPE_PRICE_HOST_STARTER', 'host', 'starter'],
    ['STRIPE_PRICE_HOST_PRO', 'host', 'pro'],
    ['STRIPE_PRICE_VENDOR_STARTER', 'vendor', 'starter'],
    ['STRIPE_PRICE_VENDOR_PRO', 'vendor', 'pro'],
  ] as const;

  for (const [envKey, role, planKey] of envPairs) {
    const envVal = process.env[envKey];
    if (envVal) mapping[envVal] = { role, planKey };
  }

  return mapping[priceId] || { role: null, planKey: null };
}
