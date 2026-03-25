import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const authCheck = await verifyAdminRequest(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = await params;
  const { db } = await getFirebaseAdmin();
  const adminAuth = getAuth();

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'updateRoles': {
        const { roles } = body as { roles: string[] };
        if (!Array.isArray(roles) || roles.length === 0) {
          return NextResponse.json({ error: 'Roles must be a non-empty array' }, { status: 400 });
        }
        const validRoles = ['seeker', 'guide', 'host', 'vendor'];
        if (!roles.every(r => validRoles.includes(r))) {
          return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });
        }
        await db.collection('users').doc(uid).update({
          roles,
          primaryRole: roles[0],
        });
        return NextResponse.json({ success: true, roles });
      }

      case 'toggleDisabled': {
        const { disabled } = body as { disabled: boolean };
        await adminAuth.updateUser(uid, { disabled });
        return NextResponse.json({ success: true, disabled });
      }

      case 'setAdmin': {
        const { admin } = body as { admin: boolean };
        await adminAuth.setCustomUserClaims(uid, { admin });
        return NextResponse.json({ success: true, admin });
      }

      case 'updateProfile': {
        const { fields } = body as { fields: Record<string, unknown> };
        if (!fields || typeof fields !== 'object') {
          return NextResponse.json({ error: 'Fields must be an object' }, { status: 400 });
        }
        // Only allow safe fields to be updated
        const allowedFields = ['displayName', 'email', 'bio', 'headline', 'locationLabel', 'profileSlug'];
        const updates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (allowedFields.includes(key)) {
            updates[key] = value;
          }
        }
        if (Object.keys(updates).length === 0) {
          return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }
        await db.collection('users').doc(uid).update(updates);
        // If displayName or email changed, also update Firebase Auth record
        const authUpdates: Record<string, string> = {};
        if (updates.displayName) authUpdates.displayName = updates.displayName as string;
        if (updates.email) authUpdates.email = updates.email as string;
        if (Object.keys(authUpdates).length > 0) {
          await adminAuth.updateUser(uid, authUpdates);
        }
        return NextResponse.json({ success: true, updates });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[ADMIN_USER_PATCH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const authCheck = await verifyAdminRequest(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = await params;
  const { db } = await getFirebaseAdmin();
  const adminAuth = getAuth();

  try {
    const body = await request.json().catch(() => ({}));
    const deleteContent = (body as any)?.deleteContent === true;

    if (deleteContent) {
      // Delete user's content in parallel
      const [retreatsSnap, spacesSnap, servicesSnap] = await Promise.all([
        db.collection('retreats').where('hostId', '==', uid).get(),
        db.collection('spaces').where('spaceOwnerId', '==', uid).get(),
        db.collection('services').where('vendorId', '==', uid).get(),
      ]);

      const batch = db.batch();
      for (const doc of [...retreatsSnap.docs, ...spacesSnap.docs, ...servicesSnap.docs]) {
        batch.delete(doc.ref);
      }
      await batch.commit();
    }

    // Delete Firestore profile and Firebase Auth account
    await db.collection('users').doc(uid).delete();
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_USER_DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
