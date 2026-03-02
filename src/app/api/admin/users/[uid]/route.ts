import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = await params;
  const { db } = await getFirebaseAdmin();

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const roles = userData.roles || [];

    // Fetch related data in parallel based on roles
    const [retreatsSnap, spacesSnap, bookingsSnap] = await Promise.all([
      roles.includes('guide')
        ? db.collection('retreats').where('hostId', '==', uid).limit(20).get()
        : Promise.resolve(null),
      roles.includes('host')
        ? db.collection('spaces').where('spaceOwnerId', '==', uid).limit(20).get()
        : Promise.resolve(null),
      roles.includes('seeker')
        ? db.collection('bookings').where('seekerId', '==', uid).limit(20).get()
        : Promise.resolve(null),
    ]);

    const retreats = retreatsSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [];
    const spaces = spacesSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [];
    const bookings = bookingsSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [];

    return NextResponse.json({
      user: {
        uid: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || '',
        lastLoginAt: userData.lastLoginAt?.toDate?.()?.toISOString() || '',
      },
      retreats,
      spaces,
      bookings,
    });
  } catch (error) {
    console.error('[ADMIN_USER_DETAIL] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
