import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/scout
 *
 * Returns scout outreach records and aggregate stats for the admin dashboard.
 * Query params: status, type, search
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db } = await getFirebaseAdmin();
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') || '';
  const typeFilter = searchParams.get('type') || '';
  const search = searchParams.get('search')?.toLowerCase() || '';

  try {
    // Build query
    let queryRef: FirebaseFirestore.Query = db.collection('scout_outreach').orderBy('sentAt', 'desc');

    if (statusFilter) {
      queryRef = queryRef.where('status', '==', statusFilter);
    }
    if (typeFilter) {
      queryRef = queryRef.where('outreachType', '==', typeFilter);
    }

    const snapshot = await queryRef.limit(500).get();

    let records = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        vendorEmail: data.vendorEmail || '',
        vendorName: data.vendorName || '',
        vendorCategory: data.vendorCategory || '',
        location: data.location || '',
        outreachType: data.outreachType || 'vendor',
        source: data.source || '',
        status: data.status || 'sent',
        manifestationId: data.manifestationId || null,
        sentAt: data.sentAt?.toDate?.()?.toISOString() || data.sentAt || '',
        followUpSentAt: data.followUpSentAt?.toDate?.()?.toISOString() || '',
        signedUpAt: data.signedUpAt?.toDate?.()?.toISOString() || '',
        contactMethod: data.contactMethod || (data.vendorEmail ? 'email' : 'none'),
        website: data.website || '',
        phone: data.phone || '',
        relevanceScore: data.relevanceScore || null,
        relevanceReason: data.relevanceReason || '',
        failReason: data.failReason || '',
      };
    });

    // In-memory search filter
    if (search) {
      records = records.filter(r =>
        r.vendorName.toLowerCase().includes(search) ||
        r.vendorEmail.toLowerCase().includes(search) ||
        r.location.toLowerCase().includes(search)
      );
    }

    // Compute stats from all records (before pagination)
    const allRecordsSnap = await db.collection('scout_outreach').get();
    const allDocs = allRecordsSnap.docs.map(d => d.data());

    const manualNeeded = allDocs.filter(d => d.status === 'manual_needed').length;
    const totalContacted = allDocs.length - manualNeeded;

    const stats = {
      total: allDocs.length,
      sent: allDocs.filter(d => d.status === 'sent').length,
      followed_up: allDocs.filter(d => d.status === 'followed_up').length,
      signed_up: allDocs.filter(d => d.status === 'signed_up').length,
      unsubscribed: allDocs.filter(d => d.status === 'unsubscribed').length,
      manual_needed: manualNeeded,
      conversionRate: totalContacted > 0
        ? (allDocs.filter(d => d.status === 'signed_up').length / totalContacted) * 100
        : 0,
      byType: {
        host: allDocs.filter(d => d.outreachType === 'host').length,
        vendor: allDocs.filter(d => d.outreachType === 'vendor').length,
      },
    };

    return NextResponse.json({ records: records.slice(0, 100), stats });
  } catch (error) {
    console.error('[ADMIN_SCOUT] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
