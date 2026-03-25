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
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status') || '';
  const cursor = searchParams.get('cursor') || '';
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '25', 10), 100);

  try {
    let queryRef: FirebaseFirestore.Query = db.collection('retreats').orderBy('createdAt', 'desc');

    if (status && status !== 'all') {
      queryRef = queryRef.where('status', '==', status);
    }

    if (cursor) {
      const cursorDoc = await db.collection('retreats').doc(cursor).get();
      if (cursorDoc.exists) {
        queryRef = queryRef.startAfter(cursorDoc);
      }
    }

    const fetchLimit = search ? 500 : pageSize;
    const snapshot = await queryRef.limit(fetchLimit).get();

    // Collect owner IDs for batch lookup
    const ownerIds = new Set<string>();
    let items = snapshot.docs.map(doc => {
      const data = doc.data();
      ownerIds.add(data.hostId || '');
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        hostId: data.hostId || '',
        hostName: '',
        status: data.status || 'draft',
        locationDescription: data.locationDescription || '',
        costPerPerson: data.costPerPerson || 0,
        capacity: data.capacity || 0,
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        type: data.type || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
      };
    });

    // Search filter
    if (search) {
      items = items.filter(i =>
        i.title.toLowerCase().includes(search) ||
        i.locationDescription.toLowerCase().includes(search)
      );
    }

    // Batch lookup owner names
    const ownerNames: Record<string, string> = {};
    const ownerIdArr = Array.from(ownerIds).filter(Boolean);
    for (let i = 0; i < ownerIdArr.length; i += 10) {
      const batch = ownerIdArr.slice(i, i + 10);
      const userSnaps = await Promise.all(batch.map(id => db.collection('users').doc(id).get()));
      for (const snap of userSnaps) {
        if (snap.exists) {
          const ud = snap.data()!;
          ownerNames[snap.id] = ud.displayName || ud.email || 'Unknown';
        }
      }
    }

    items = items.map(i => ({ ...i, hostName: ownerNames[i.hostId] || 'Unknown' }));

    const paginated = items.slice(0, pageSize);
    const lastId = paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return NextResponse.json({ items: paginated, nextCursor: lastId });
  } catch (error) {
    console.error('[ADMIN_RETREATS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
