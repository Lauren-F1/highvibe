import { NextResponse } from 'next/server';
import { firestoreDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

// WARNING: This endpoint should be protected by admin-only middleware.
// We are adding a secret query parameter as an extra layer of security.

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
  // Add another layer of protection by checking for a specific query param
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const codesRef = firestoreDb.collection('founder_codes');
  const batch = firestoreDb.batch();
  let totalGenerated = 0;

  try {
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

    return NextResponse.json({
      ok: true,
      message: `Successfully seeded ${totalGenerated} founder codes.`,
      breakdown: CODES_TO_GENERATE,
    });
  } catch (error: any) {
    console.error("SEED_CODES_ERROR", error);
    return NextResponse.json({ ok: false, error: 'Failed to seed codes.', details: error.message }, { status: 500 });
  }
}
