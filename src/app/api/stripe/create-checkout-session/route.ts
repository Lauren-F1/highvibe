import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { allRetreats } from '@/lib/mock-data';
import appConfig from '@/config/app.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

interface ProviderInfo {
  id: string;
  role: string;
  amount: number;
  feePercent: number;
  label: string;
}

// Resolve a provider's platform fee based on their role and plan tier
async function getProviderFeePercent(
  db: FirebaseFirestore.Firestore,
  providerId: string,
  role: string,
): Promise<number> {
  const plans = (appConfig.plans as Record<string, Record<string, { platformFeePercent: number }>>);
  const rolePlans = plans[role];
  const defaultFee = rolePlans?.['pay-as-you-go']?.platformFeePercent ?? 12.5;

  if (!providerId || providerId === 'guide-placeholder-id') return defaultFee;

  try {
    const providerDoc = await db.collection('users').doc(providerId).get();
    if (!providerDoc.exists) return defaultFee;
    const planKey = providerDoc.data()?.[`currentPlanKey_${role}`] || 'pay-as-you-go';
    return rolePlans?.[planKey]?.platformFeePercent ?? defaultFee;
  } catch {
    return defaultFee;
  }
}

export async function POST(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const body = await request.json();
    const { retreatId, applyCredit, creditId, liabilityAccepted, medicalDisclosureAccepted, providerLineItems, quantity: rawQuantity } = body;

    if (!retreatId || !liabilityAccepted) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quantity = Math.max(1, Math.min(10, parseInt(rawQuantity || '1', 10) || 1));

    const { db } = await getFirebaseAdmin();

    // Fetch retreat — try Firestore first, fall back to mock data
    let retreatTitle = '';
    let retreatPrice = 0;
    let retreatProviderId = '';
    let isMultiProvider = false;

    const retreatDoc = await db.collection('retreats').doc(retreatId).get();
    if (retreatDoc.exists) {
      const data = retreatDoc.data()!;
      retreatTitle = data.title || 'Retreat';
      retreatPrice = data.costPerPerson || data.price || 0;
      retreatProviderId = data.guideId || data.createdBy || '';
      isMultiProvider = !!(data.spaceId || (data.vendorLineItems && data.vendorLineItems.length > 0));

      // Overbooking prevention
      if (data.isFullyBooked) {
        return NextResponse.json({ error: 'This retreat is fully booked.' }, { status: 409 });
      }
      if (data.spotsRemaining != null && data.spotsRemaining < quantity) {
        return NextResponse.json({
          error: `Not enough spots available. Only ${data.spotsRemaining} spot${data.spotsRemaining === 1 ? '' : 's'} remaining.`,
        }, { status: 409 });
      }
    } else {
      // Fall back to mock data
      const mockRetreat = allRetreats.find(r => r.id === retreatId);
      if (!mockRetreat) {
        return NextResponse.json({ error: 'Retreat not found' }, { status: 404 });
      }
      retreatTitle = mockRetreat.title;
      retreatPrice = mockRetreat.price * 5; // mock package price (matches checkout page)
      retreatProviderId = 'guide-placeholder-id';
    }

    // Handle manifest credit discount (atomic reservation via transaction)
    let discount = 0;
    let validCreditId = '';
    if (applyCredit && creditId) {
      try {
        const creditResult = await db.runTransaction(async (transaction) => {
          const creditRef = db.collection('manifest_credits').doc(creditId);
          const creditDoc = await transaction.get(creditRef);
          if (!creditDoc.exists) return { discount: 0, creditId: '' };

          const creditData = creditDoc.data()!;
          const now = new Date();
          const expiryDate = creditData.expiry_date?.toDate ? creditData.expiry_date.toDate() : new Date(creditData.expiry_date);
          const isExpired = expiryDate < now;

          if (creditData.seeker_id === uid && creditData.status === 'available' && !isExpired) {
            transaction.update(creditRef, { status: 'reserved' });
            return { discount: Math.min(creditData.issued_amount || 0, retreatPrice), creditId };
          } else if (creditData.status === 'available' && isExpired) {
            transaction.update(creditRef, { status: 'expired' });
          }
          return { discount: 0, creditId: '' };
        });
        discount = creditResult.discount;
        validCreditId = creditResult.creditId;
      } catch (txnError) {
        console.error('[STRIPE_CHECKOUT] Credit reservation transaction failed:', txnError);
        // Continue without credit — don't block checkout
      }
    }

    const totalInCents = Math.round((retreatPrice - discount) * 100 * quantity);
    if (totalInCents <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    // Fetch user email for prefill
    const userDoc = await db.collection('users').doc(uid).get();
    const userEmail = userDoc.exists ? userDoc.data()?.email : undefined;

    const stripe = getStripe();

    // Build provider info for metadata
    const providers: ProviderInfo[] = [];

    if (isMultiProvider && providerLineItems && providerLineItems.length > 0) {
      // Multi-provider: build individual fee info for each provider
      for (const item of providerLineItems as { providerId: string; providerRole: string; label: string; amount: number }[]) {
        const feePercent = await getProviderFeePercent(db, item.providerId, item.providerRole);
        providers.push({
          id: item.providerId,
          role: item.providerRole,
          amount: item.amount,
          feePercent,
          label: item.label,
        });
      }
    } else {
      // Single provider (guide only) — use existing logic
      const feePercent = await getProviderFeePercent(db, retreatProviderId, 'guide');
      providers.push({
        id: retreatProviderId,
        role: 'guide',
        amount: retreatPrice,
        feePercent,
        label: retreatTitle,
      });
    }

    // Funds are always held by HighVibe until 24 hours after retreat start date.
    // No destination charges — all transfers happen via separate stripe.transfers.create()
    // after the retreat begins. This ensures proper escrow behavior.

    const sessionParams: any = {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: quantity > 1 ? `${retreatTitle} (x${quantity} spots)` : retreatTitle },
            unit_amount: Math.round((retreatPrice - discount) * 100),
          },
          quantity,
        },
      ],
      ...(userEmail ? { customer_email: userEmail } : {}),
      success_url: `${BASE_URL}/checkout/${retreatId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/checkout/${retreatId}`,
      metadata: {
        userId: uid,
        retreatId,
        creditId: validCreditId,
        discount: String(discount),
        retreatPrice: String(retreatPrice),
        providerId: retreatProviderId,
        platformFeePercent: String(providers[0]?.feePercent ?? 12.5),
        liabilityAccepted: String(liabilityAccepted),
        medicalDisclosureAccepted: String(medicalDisclosureAccepted || false),
        retreatTitle,
        providers: JSON.stringify(providers),
        isMultiProvider: String(providers.length > 1),
        quantity: String(quantity),
      },
      payment_intent_data: {
        metadata: {
          userId: uid,
          retreatId,
          providerId: retreatProviderId,
          bookingSource: 'highvibe',
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[STRIPE_CHECKOUT] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
