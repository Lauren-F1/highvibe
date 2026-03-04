import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/scout/signup-complete
 *
 * Called after a scouted vendor signs up to update their outreach record.
 * Body: { email: string }
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const { db, FieldValue } = await getFirebaseAdmin();

    // Find matching outreach records
    const outreachSnap = await db.collection('scout_outreach')
      .where('vendorEmail', '==', email.toLowerCase())
      .where('status', 'in', ['sent', 'followed_up', 'opened'])
      .limit(5)
      .get();

    if (outreachSnap.empty) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    const batch = db.batch();
    for (const doc of outreachSnap.docs) {
      batch.update(doc.ref, {
        status: 'signed_up',
        signedUpAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    console.log(`[SCOUT] Vendor ${email} signed up, updated ${outreachSnap.size} outreach records`);

    return NextResponse.json({ success: true, updated: outreachSnap.size });
  } catch (error) {
    console.error('[SCOUT_SIGNUP] Error:', error);
    return NextResponse.json({ error: 'Failed to update outreach' }, { status: 500 });
  }
}
