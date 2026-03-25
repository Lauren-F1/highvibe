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
    const doc = await db.collection('spaces').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const data = doc.data()!;

    let ownerName = 'Unknown';
    if (data.spaceOwnerId) {
      const ownerDoc = await db.collection('users').doc(data.spaceOwnerId).get();
      if (ownerDoc.exists) {
        const od = ownerDoc.data()!;
        ownerName = od.displayName || od.email || 'Unknown';
      }
    }

    return NextResponse.json({
      space: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
      },
      ownerName,
    });
  } catch (error) {
    console.error('[ADMIN_SPACE_DETAIL] Error:', error);
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
      'name', 'description', 'propertyType', 'city', 'stateProvince', 'country',
      'locationDescription', 'capacity', 'bedrooms', 'bathrooms', 'dailyRate',
      'currency', 'amenities', 'hostVibe', 'status', 'moderationStatus',
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
    await db.collection('spaces').doc(id).update(updates);

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('[ADMIN_SPACE_PATCH] Error:', error);
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
    const doc = await db.collection('spaces').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    await db.collection('spaces').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_SPACE_DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
