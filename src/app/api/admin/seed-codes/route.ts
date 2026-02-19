import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

const CODES_TO_GENERATE = {
  guide: 100,
  host: 50,
  vendor: 100,
};

function generateCode(role: 'guide' | 'host' | 'vendor'): string {
  const randomPart = randomBytes(4).toString('hex').toUpperCase(); // 8 chars
  return `HV-${role.toUpperCase()}-${randomPart}`;
}

export async function GET(request: Request) {
  // 3. Safety Gate: Only allow in LAUNCH_MODE
  if (process.env.LAUNCH_MODE !== 'true') {
    return NextResponse.json({
        ok: false,
        createdCount: 0,
        alreadySeeded: false,
        message: 'Seeding is only allowed when LAUNCH_MODE is true.',
    }, { status: 403 });
  }
  
  // 1. Check for a strong admin secret
  const adminSecret = process.env.ADMIN_SEED_SECRET;
  if (!adminSecret || adminSecret === 'changeme') {
    console.error('CRITICAL: ADMIN_SEED_SECRET is not set or is insecure.');
    return NextResponse.json({
        ok: false,
        createdCount: 0,
        alreadySeeded: false,
        message: 'Seeding failed: ADMIN_SEED_SECRET is not configured. Please set a strong, unique secret in apphosting.yaml.',
    }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== adminSecret) {
    return NextResponse.json({
        ok: false,
        createdCount: 0,
        alreadySeeded: false,
        message: 'Unauthorized: Invalid secret.'
    }, { status: 401 });
  }
  
  const firestoreDb = getFirestoreDb();
  const codesRef = firestoreDb.collection('founder_codes');
  const batch = firestoreDb.batch();
  let totalGenerated = 0;

  try {
    // 2. Idempotency check
    const existingCodesSnap = await codesRef.limit(1).get();
    if (!existingCodesSnap.empty) {
        return NextResponse.json({
            ok: false,
            createdCount: 0,
            alreadySeeded: true,
            message: 'The founderCodes collection has already been seeded. No new codes were created.',
        }, { status: 409 });
    }

    for (const [role, count] of Object.entries(CODES_TO_GENERATE)) {
      for (let i = 0; i < count; i++) {
        const code = generateCode(role as any);
        const docRef = codesRef.doc(code);
        batch.set(docRef, {
          roleBucket: role,
          status: 'available',
          claimedBy: null,
          claimedAt: null,
          createdAt: FieldValue.serverTimestamp(),
        });
        totalGenerated++;
      }
    }

    await batch.commit();

    // 4. Standardized JSON response
    return NextResponse.json({
      ok: true,
      createdCount: totalGenerated,
      alreadySeeded: false,
      message: `Successfully seeded ${totalGenerated} founder codes.`,
    });

  } catch (error: any) {
    console.error("SEED_CODES_ERROR", error);
    return NextResponse.json({ 
        ok: false,
        createdCount: 0,
        alreadySeeded: false,
        message: 'An unexpected error occurred during seeding.',
    }, { status: 500 });
  }
}
