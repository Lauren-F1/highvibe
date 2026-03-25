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
    let queryRef: FirebaseFirestore.Query = db.collection('services').orderBy('createdAt', 'desc');

    if (status && status !== 'all') {
      queryRef = queryRef.where('status', '==', status);
    }

    if (cursor) {
      const cursorDoc = await db.collection('services').doc(cursor).get();
      if (cursorDoc.exists) {
        queryRef = queryRef.startAfter(cursorDoc);
      }
    }

    const fetchLimit = search ? 500 : pageSize;
    const snapshot = await queryRef.limit(fetchLimit).get();

    const ownerIds = new Set<string>();
    let items = snapshot.docs.map(doc => {
      const data = doc.data();
      ownerIds.add(data.vendorId || '');
      return {
        id: doc.id,
        name: data.name || 'Untitled',
        vendorId: data.vendorId || '',
        vendorName: '',
        status: data.status || 'draft',
        category: data.category || '',
        description: data.description || '',
        startingPrice: data.startingPrice || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
      };
    });

    if (search) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(search) ||
        i.category.toLowerCase().includes(search)
      );
    }

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

    items = items.map(i => ({ ...i, vendorName: ownerNames[i.vendorId] || 'Unknown' }));

    const paginated = items.slice(0, pageSize);
    const lastId = paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return NextResponse.json({ items: paginated, nextCursor: lastId });
  } catch (error) {
    console.error('[ADMIN_SERVICES] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
