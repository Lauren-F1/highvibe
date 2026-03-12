import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/stripe-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/proposals/accept
 *
 * Accepts a proposal: creates a retreat document from the proposal + manifestation data,
 * updates the proposal and match statuses, and returns the new retreatId for checkout.
 *
 * Body: { proposalId: string }
 * Returns: { retreatId: string }
 */
export async function POST(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const { proposalId } = await request.json();

    if (!proposalId) {
      return NextResponse.json({ error: 'Missing proposalId' }, { status: 400 });
    }

    const { db, FieldValue } = await getFirebaseAdmin();

    // Load proposal
    const proposalRef = db.collection('proposals').doc(proposalId);
    const proposalDoc = await proposalRef.get();
    if (!proposalDoc.exists) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    const proposal = proposalDoc.data()!;

    // Verify the seeker owns the manifestation
    if (proposal.seeker_id !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (proposal.status === 'accepted') {
      // Already accepted — return the existing retreat
      if (proposal.retreat_id) {
        return NextResponse.json({ retreatId: proposal.retreat_id });
      }
    }

    if (proposal.status !== 'submitted' && proposal.status !== 'viewed') {
      return NextResponse.json({ error: `Proposal cannot be accepted (status: ${proposal.status})` }, { status: 400 });
    }

    // Load manifestation for context
    const manifestationDoc = await db.collection('manifestations').doc(proposal.manifestation_id).get();
    const manifestation = manifestationDoc.exists ? manifestationDoc.data()! : {};

    // Load provider profile
    const providerDoc = await db.collection('users').doc(proposal.provider_id).get();
    const provider = providerDoc.exists ? providerDoc.data()! : {};

    // Build retreat document from proposal + manifestation data
    const destination = manifestation.destination || {};
    const retreatTitle = `${manifestation.retreat_types?.join(' & ') || 'Custom'} Retreat in ${destination.region || destination.country || 'TBD'}`;

    const retreatData: Record<string, any> = {
      title: retreatTitle,
      costPerPerson: proposal.proposed_price,
      type: manifestation.retreat_types?.[0] || 'Custom',
      status: 'pending_payment',
      createdBy: proposal.provider_id,
      createdFromProposal: proposalId,
      manifestationId: proposal.manifestation_id,
      seekerId: uid,
      destination: destination,
      groupSize: manifestation.group_size || 1,
      luxuryTier: manifestation.luxury_tier || '',
      lodgingPreference: manifestation.lodging_preference || '',
      createdAt: FieldValue.serverTimestamp(),
    };

    // Assign provider to correct role field
    if (proposal.provider_role === 'guide') {
      retreatData.guideId = proposal.provider_id;
      retreatData.guideName = provider.displayName || '';
    } else if (proposal.provider_role === 'host') {
      retreatData.hostId = proposal.provider_id;
      retreatData.hostName = provider.displayName || '';
    } else if (proposal.provider_role === 'vendor') {
      retreatData.vendorLineItems = [{
        vendorId: proposal.provider_id,
        vendorName: provider.displayName || '',
        description: `${provider.vendorCategories?.[0] || 'Service'} by ${provider.displayName || 'Vendor'}`,
        amount: proposal.proposed_price,
      }];
      retreatData.costPerPerson = proposal.proposed_price;
    }

    // Set dates if proposed
    if (proposal.proposed_dates) {
      retreatData.startDate = proposal.proposed_dates.start_date;
      retreatData.endDate = proposal.proposed_dates.end_date;
    }

    // Create the retreat doc
    const retreatRef = await db.collection('retreats').add(retreatData);

    // Update proposal and match in a batch
    const batch = db.batch();
    batch.update(proposalRef, {
      status: 'accepted',
      accepted_at: FieldValue.serverTimestamp(),
      retreat_id: retreatRef.id,
    });

    if (proposal.match_id) {
      batch.update(db.collection('matches').doc(proposal.match_id), {
        status: 'accepted',
      });
    }

    // Update manifestation status
    batch.update(db.collection('manifestations').doc(proposal.manifestation_id), {
      status: 'booked',
    });

    await batch.commit();

    console.log(`[PROPOSAL_ACCEPT] Proposal ${proposalId} accepted, retreat ${retreatRef.id} created by seeker ${uid}`);

    return NextResponse.json({ retreatId: retreatRef.id });
  } catch (error: any) {
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[PROPOSAL_ACCEPT] Error:', error);
    return NextResponse.json({ error: 'Failed to accept proposal' }, { status: 500 });
  }
}
