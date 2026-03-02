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
  const role = searchParams.get('role') || '';
  const cursor = searchParams.get('cursor') || '';
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '25', 10), 100);

  try {
    // Build base query
    let queryRef: FirebaseFirestore.Query = db.collection('users').orderBy('createdAt', 'desc');

    if (role) {
      queryRef = queryRef.where('roles', 'array-contains', role);
    }

    if (cursor) {
      const cursorDoc = await db.collection('users').doc(cursor).get();
      if (cursorDoc.exists) {
        queryRef = queryRef.startAfter(cursorDoc);
      }
    }

    // Fetch extra if search is active (need to filter in memory)
    const fetchLimit = search ? 500 : pageSize;
    const snapshot = await queryRef.limit(fetchLimit).get();

    let users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        displayName: data.displayName || '',
        email: data.email || '',
        roles: data.roles || [],
        primaryRole: data.primaryRole || data.roles?.[0] || '',
        avatarUrl: data.avatarUrl || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || '',
      };
    });

    // In-memory search filter
    if (search) {
      users = users.filter(u =>
        u.displayName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    // Apply page size after search filter
    const paginatedUsers = users.slice(0, pageSize);
    const lastDoc = paginatedUsers.length > 0 ? paginatedUsers[paginatedUsers.length - 1].uid : null;

    // Count by role (run in parallel)
    const [totalSnap, seekerSnap, guideSnap, hostSnap, vendorSnap] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('users').where('roles', 'array-contains', 'seeker').count().get(),
      db.collection('users').where('roles', 'array-contains', 'guide').count().get(),
      db.collection('users').where('roles', 'array-contains', 'host').count().get(),
      db.collection('users').where('roles', 'array-contains', 'vendor').count().get(),
    ]);

    return NextResponse.json({
      users: paginatedUsers,
      totalCount: totalSnap.data().count,
      countByRole: {
        seeker: seekerSnap.data().count,
        guide: guideSnap.data().count,
        host: hostSnap.data().count,
        vendor: vendorSnap.data().count,
      },
      nextCursor: lastDoc,
    });
  } catch (error) {
    console.error('[ADMIN_USERS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
