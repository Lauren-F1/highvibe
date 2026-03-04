import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db } = await getFirebaseAdmin();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all'; // 'retreats' | 'spaces' | 'services' | 'all'
  const status = searchParams.get('status') || 'published'; // 'published' | 'flagged' | 'all'

  try {
    const results: Array<{
      id: string;
      type: 'retreat' | 'space' | 'service';
      title: string;
      ownerId: string;
      ownerName: string;
      status: string;
      moderationStatus?: string;
      createdAt: string;
      locationDescription?: string;
      price?: number;
    }> = [];

    const collections = [];
    if (type === 'all' || type === 'retreats') collections.push({ name: 'retreats', type: 'retreat' as const, titleField: 'title', ownerField: 'hostId' });
    if (type === 'all' || type === 'spaces') collections.push({ name: 'spaces', type: 'space' as const, titleField: 'name', ownerField: 'spaceOwnerId' });
    if (type === 'all' || type === 'services') collections.push({ name: 'services', type: 'service' as const, titleField: 'name', ownerField: 'vendorId' });

    const snapshots = await Promise.all(
      collections.map(async (col) => {
        let q = db.collection(col.name).orderBy('createdAt', 'desc').limit(50);

        if (status === 'flagged') {
          q = db.collection(col.name).where('moderationStatus', '==', 'flagged').orderBy('createdAt', 'desc').limit(50);
        } else if (status === 'published') {
          q = db.collection(col.name).where('status', '==', 'published').orderBy('createdAt', 'desc').limit(50);
        }

        const snap = await q.get();
        return { col, snap };
      })
    );

    // Collect all owner IDs for batch lookup
    const ownerIds = new Set<string>();
    const rawItems: Array<{ col: typeof collections[0]; doc: FirebaseFirestore.QueryDocumentSnapshot }> = [];

    for (const { col, snap } of snapshots) {
      for (const doc of snap.docs) {
        const data = doc.data();
        ownerIds.add(data[col.ownerField] || '');
        rawItems.push({ col, doc });
      }
    }

    // Batch lookup owner names
    const ownerNames: Record<string, string> = {};
    const ownerIdArr = Array.from(ownerIds).filter(Boolean);
    if (ownerIdArr.length > 0) {
      const batchSize = 10;
      for (let i = 0; i < ownerIdArr.length; i += batchSize) {
        const batch = ownerIdArr.slice(i, i + batchSize);
        const userSnaps = await Promise.all(
          batch.map(id => db.collection('users').doc(id).get())
        );
        for (const userSnap of userSnaps) {
          if (userSnap.exists) {
            const ud = userSnap.data()!;
            ownerNames[userSnap.id] = ud.displayName || ud.email || 'Unknown';
          }
        }
      }
    }

    // Build results
    for (const { col, doc } of rawItems) {
      const data = doc.data();
      results.push({
        id: doc.id,
        type: col.type,
        title: data[col.titleField] || 'Untitled',
        ownerId: data[col.ownerField] || '',
        ownerName: ownerNames[data[col.ownerField] || ''] || 'Unknown',
        status: data.status || 'draft',
        moderationStatus: data.moderationStatus || 'unreviewed',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        locationDescription: data.locationDescription || data.location || '',
        price: data.costPerPerson || data.dailyRate || data.startingPrice || 0,
      });
    }

    // Sort by createdAt desc
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ items: results });
  } catch (error) {
    console.error('[ADMIN_MODERATION] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db } = await getFirebaseAdmin();

  try {
    const body = await request.json();
    const { itemId, itemType, action } = body as {
      itemId: string;
      itemType: 'retreat' | 'space' | 'service';
      action: 'approve' | 'flag' | 'unpublish';
    };

    if (!itemId || !itemType || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const collectionMap = { retreat: 'retreats', space: 'spaces', service: 'services' };
    const collectionName = collectionMap[itemType];
    if (!collectionName) {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    const docRef = db.collection(collectionName).doc(itemId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      moderatedAt: new Date(),
      moderatedBy: auth.uid,
    };

    switch (action) {
      case 'approve':
        updates.moderationStatus = 'approved';
        break;
      case 'flag':
        updates.moderationStatus = 'flagged';
        updates.status = 'paused';
        break;
      case 'unpublish':
        updates.status = 'draft';
        updates.moderationStatus = 'unpublished';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await docRef.update(updates);

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('[ADMIN_MODERATION] PATCH Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
