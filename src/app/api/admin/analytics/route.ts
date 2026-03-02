import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db } = await getFirebaseAdmin();

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      seekerCount,
      guideCount,
      hostCount,
      vendorCount,
      retreatsCount,
      bookingsCount,
      recentUsersSnap,
      recentRetreatsSnap,
      recentBookingsSnap,
      signupsSnap,
    ] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('users').where('roles', 'array-contains', 'seeker').count().get(),
      db.collection('users').where('roles', 'array-contains', 'guide').count().get(),
      db.collection('users').where('roles', 'array-contains', 'host').count().get(),
      db.collection('users').where('roles', 'array-contains', 'vendor').count().get(),
      db.collection('retreats').count().get(),
      db.collection('bookings').count().get(),
      db.collection('users').orderBy('createdAt', 'desc').limit(10).get(),
      db.collection('retreats').orderBy('createdAt', 'desc').limit(10).get(),
      db.collection('bookings').orderBy('createdAt', 'desc').limit(10).get(),
      db.collection('users').where('createdAt', '>=', thirtyDaysAgo).orderBy('createdAt', 'asc').get(),
    ]);

    // Bucket signups by day
    const signupsByDay: Record<string, number> = {};
    signupsSnap.docs.forEach(doc => {
      const createdAt = doc.data().createdAt?.toDate?.();
      if (createdAt) {
        const day = createdAt.toISOString().split('T')[0];
        signupsByDay[day] = (signupsByDay[day] || 0) + 1;
      }
    });

    // Build recent activity feed
    const recentActivity: Array<{ type: string; description: string; timestamp: string; userId?: string }> = [];

    recentUsersSnap.docs.forEach(doc => {
      const data = doc.data();
      recentActivity.push({
        type: 'signup',
        description: `${data.displayName || data.email || 'Someone'} signed up as ${data.primaryRole || data.roles?.[0] || 'user'}`,
        timestamp: data.createdAt?.toDate?.()?.toISOString() || '',
        userId: doc.id,
      });
    });

    recentRetreatsSnap.docs.forEach(doc => {
      const data = doc.data();
      recentActivity.push({
        type: 'retreat',
        description: `New retreat "${data.title || 'Untitled'}" created`,
        timestamp: data.createdAt?.toDate?.()?.toISOString() || '',
      });
    });

    recentBookingsSnap.docs.forEach(doc => {
      const data = doc.data();
      recentActivity.push({
        type: 'booking',
        description: `New booking for $${data.totalAmount || 0}`,
        timestamp: data.createdAt?.toDate?.()?.toISOString() || '',
      });
    });

    // Sort by timestamp descending
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      summary: {
        totalUsers: totalUsers.data().count,
        totalSeekers: seekerCount.data().count,
        totalGuides: guideCount.data().count,
        totalHosts: hostCount.data().count,
        totalVendors: vendorCount.data().count,
        totalRetreats: retreatsCount.data().count,
        totalBookings: bookingsCount.data().count,
      },
      signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
      roleBreakdown: [
        { role: 'Seeker', count: seekerCount.data().count },
        { role: 'Guide', count: guideCount.data().count },
        { role: 'Host', count: hostCount.data().count },
        { role: 'Vendor', count: vendorCount.data().count },
      ],
      recentActivity: recentActivity.slice(0, 20),
    });
  } catch (error) {
    console.error('[ADMIN_ANALYTICS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
