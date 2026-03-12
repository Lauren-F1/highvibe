import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/stripe-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/proposals/decline
 *
 * Declines a proposal and updates the match status.
 * Body: { proposalId: string }
 */
export async function POST(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const { proposalId } = await request.json();

    if (!proposalId) {
      return NextResponse.json({ error: 'Missing proposalId' }, { status: 400 });
    }

    const { db, FieldValue } = await getFirebaseAdmin();

    const proposalRef = db.collection('proposals').doc(proposalId);
    const proposalDoc = await proposalRef.get();
    if (!proposalDoc.exists) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    const proposal = proposalDoc.data()!;

    if (proposal.seeker_id !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (proposal.status === 'declined') {
      return NextResponse.json({ success: true });
    }

    const batch = db.batch();
    batch.update(proposalRef, {
      status: 'declined',
      declined_at: FieldValue.serverTimestamp(),
    });

    if (proposal.match_id) {
      batch.update(db.collection('matches').doc(proposal.match_id), {
        status: 'declined',
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[PROPOSAL_DECLINE] Error:', error);
    return NextResponse.json({ error: 'Failed to decline proposal' }, { status: 500 });
  }
}
