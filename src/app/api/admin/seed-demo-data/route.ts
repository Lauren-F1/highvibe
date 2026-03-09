import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Seeds the Firestore database with realistic demo data.
 *
 * Usage: GET /api/admin/seed-demo-data?secret=YOUR_ADMIN_SEED_SECRET
 *
 * Optional query params:
 *   &clear=true  — Deletes all existing demo data before seeding (idempotent re-run)
 *
 * Creates:
 *   - ~250 demo user profiles (guides, vendors, hosts)
 *   - ~60 fully-booked retreats
 *   - ~150 booked-out vendor services
 *   - ~75 booked-out retreat spaces
 */
export async function GET(request: Request) {
  try {
    const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
    const { db, FieldValue } = await getFirebaseAdmin();

    // Auth check
    const adminSecret = process.env.ADMIN_SEED_SECRET;
    if (!adminSecret || adminSecret.length < 20) {
      return NextResponse.json({ ok: false, message: 'ADMIN_SEED_SECRET not configured.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    if (searchParams.get('secret') !== adminSecret) {
      return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
    }

    const shouldClear = searchParams.get('clear') === 'true';

    // Clear existing demo data if requested
    if (shouldClear) {
      const collections = ['users', 'retreats', 'services', 'spaces'];
      for (const col of collections) {
        const snap = await db.collection(col).where('isDemo', '==', true).get();
        if (!snap.empty) {
          const batches: FirebaseFirestore.WriteBatch[] = [db.batch()];
          let opCount = 0;
          for (const doc of snap.docs) {
            if (opCount >= 499) {
              batches.push(db.batch());
              opCount = 0;
            }
            batches[batches.length - 1].delete(doc.ref);
            opCount++;
          }
          for (const batch of batches) {
            await batch.commit();
          }
        }
      }
      console.log('[SEED] Cleared existing demo data');
    }

    // Idempotency check (skip if clearing)
    if (!shouldClear) {
      const existingDemo = await db.collection('users').where('isDemo', '==', true).limit(1).get();
      if (!existingDemo.empty) {
        return NextResponse.json({
          ok: false,
          message: 'Demo data already exists. Use ?clear=true to re-seed.',
        }, { status: 409 });
      }
    }

    // Generate all demo data
    const { generateAllDemoData } = await import('@/lib/demo-seed-data');
    const { users, retreats, services, spaces } = generateAllDemoData();

    // Write in batches (Firestore max 500 operations per batch)
    const BATCH_SIZE = 450;

    // Helper to write documents in batches
    async function batchWrite(
      collectionName: string,
      docs: Record<string, unknown>[],
      idField?: string,
    ): Promise<number> {
      let count = 0;
      let batch = db.batch();
      let batchOps = 0;

      for (const docData of docs) {
        const data = { ...docData };

        // Replace SERVER_TIMESTAMP markers
        for (const [key, val] of Object.entries(data)) {
          if (val === 'SERVER_TIMESTAMP') {
            data[key] = FieldValue.serverTimestamp();
          }
        }

        let ref: FirebaseFirestore.DocumentReference;
        if (idField && data[idField]) {
          ref = db.collection(collectionName).doc(data[idField] as string);
        } else {
          ref = db.collection(collectionName).doc();
        }

        batch.set(ref, data);
        batchOps++;
        count++;

        if (batchOps >= BATCH_SIZE) {
          await batch.commit();
          batch = db.batch();
          batchOps = 0;
        }
      }

      if (batchOps > 0) {
        await batch.commit();
      }

      return count;
    }

    const userCount = await batchWrite('users', users as unknown as Record<string, unknown>[], 'id');
    const retreatCount = await batchWrite('retreats', retreats as unknown as Record<string, unknown>[]);
    const serviceCount = await batchWrite('services', services as unknown as Record<string, unknown>[]);
    const spaceCount = await batchWrite('spaces', spaces as unknown as Record<string, unknown>[]);

    console.log(`[SEED] Created ${userCount} users, ${retreatCount} retreats, ${serviceCount} services, ${spaceCount} spaces`);

    return NextResponse.json({
      ok: true,
      message: `Seeded ${userCount} users, ${retreatCount} retreats, ${serviceCount} services, ${spaceCount} spaces.`,
      counts: { users: userCount, retreats: retreatCount, services: serviceCount, spaces: spaceCount },
    });
  } catch (error: any) {
    console.error('[SEED_DEMO_ERROR]', error);
    return NextResponse.json({
      ok: false,
      message: `Seeding failed: ${error.message}`,
    }, { status: 500 });
  }
}
