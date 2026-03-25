import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { db } = await getFirebaseAdmin();

  try {
    const doc = await db.collection('retreats').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Retreat not found' }, { status: 404 });
    }

    const data = doc.data()!;

    // Lookup host name
    let hostName = 'Unknown';
    if (data.hostId) {
      const hostDoc = await db.collection('users').doc(data.hostId).get();
      if (hostDoc.exists) {
        const hd = hostDoc.data()!;
        hostName = hd.displayName || hd.email || 'Unknown';
      }
    }

    return NextResponse.json({
      retreat: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
      },
      hostName,
    });
  } catch (error) {
    console.error('[ADMIN_RETREAT_DETAIL] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { db } = await getFirebaseAdmin();

  try {
    const body = await request.json();
    const { fields } = body as { fields: Record<string, unknown> };

    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ error: 'Fields must be an object' }, { status: 400 });
    }

    // Allow updating these fields
    const allowedFields = [
      'title', 'description', 'type', 'startDate', 'endDate',
      'costPerPerson', 'currency', 'capacity', 'locationDescription',
      'included', 'status', 'moderationStatus',
    ];

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.updatedAt = new Date();
    await db.collection('retreats').doc(id).update(updates);

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('[ADMIN_RETREAT_PATCH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { db } = await getFirebaseAdmin();

  try {
    const doc = await db.collection('retreats').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Retreat not found' }, { status: 404 });
    }

    await db.collection('retreats').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_RETREAT_DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
