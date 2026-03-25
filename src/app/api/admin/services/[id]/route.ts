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
    const doc = await db.collection('services').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const data = doc.data()!;

    let vendorName = 'Unknown';
    if (data.vendorId) {
      const vendorDoc = await db.collection('users').doc(data.vendorId).get();
      if (vendorDoc.exists) {
        const vd = vendorDoc.data()!;
        vendorName = vd.displayName || vd.email || 'Unknown';
      }
    }

    return NextResponse.json({
      service: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
      },
      vendorName,
    });
  } catch (error) {
    console.error('[ADMIN_SERVICE_DETAIL] Error:', error);
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

    const allowedFields = [
      'name', 'description', 'category', 'startingPrice',
      'status', 'moderationStatus',
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
    await db.collection('services').doc(id).update(updates);

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('[ADMIN_SERVICE_PATCH] Error:', error);
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
    const doc = await db.collection('services').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    await db.collection('services').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_SERVICE_DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
