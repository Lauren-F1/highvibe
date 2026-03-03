'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, getDoc, doc, Timestamp, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type Booking = {
  id: string;
  seekerId: string;
  bookedEntityOwnerId: string;
  retreatId: string;
  status: string;
  totalAmount: number;
  platformFeeAmount: number;
  stripeProcessingFee: number;
  providerNetPayout: number;
  paymentModel: string;
  currency: string;
  createdAt: Timestamp;
  chargebackStatus?: string;
  seekerName?: string;
  providerName?: string;
};

const PAGE_SIZE = 25;

export default function AdminBookingsPage() {
  const firestore = useFirestore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Summary stats
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPlatformFees = bookings.reduce((sum, b) => sum + (b.platformFeeAmount || 0), 0);
  const totalBookings = bookings.length;

  const fetchBookings = async (afterDoc?: DocumentSnapshot | null) => {
    if (!firestore) return;
    setLoading(true);

    try {
      let q = query(
        collection(firestore, 'bookings'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      if (afterDoc) {
        q = query(
          collection(firestore, 'bookings'),
          orderBy('createdAt', 'desc'),
          startAfter(afterDoc),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as Booking));

      // Fetch user names for display
      const userCache: Record<string, string> = {};
      for (const booking of data) {
        for (const uid of [booking.seekerId, booking.bookedEntityOwnerId]) {
          if (uid && !userCache[uid]) {
            try {
              const userSnap = await getDoc(doc(firestore, 'users', uid));
              userCache[uid] = userSnap.exists() ? (userSnap.data().displayName || userSnap.data().email || uid) : uid;
            } catch {
              userCache[uid] = uid;
            }
          }
        }
        booking.seekerName = userCache[booking.seekerId] || booking.seekerId;
        booking.providerName = userCache[booking.bookedEntityOwnerId] || booking.bookedEntityOwnerId || 'N/A';
      }

      if (afterDoc) {
        setBookings(prev => [...prev, ...data]);
      } else {
        setBookings(data);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const statusBadge = (status: string, chargebackStatus?: string) => {
    if (chargebackStatus === 'open') return <Badge variant="destructive">Disputed</Badge>;
    if (chargebackStatus === 'lost') return <Badge variant="destructive">Chargeback Lost</Badge>;
    if (chargebackStatus === 'won') return <Badge variant="secondary">Dispute Won</Badge>;
    if (status === 'confirmed') return <Badge>Confirmed</Badge>;
    if (status === 'pending_payment') return <Badge variant="outline">Pending</Badge>;
    if (status === 'payment_failed') return <Badge variant="destructive">Failed</Badge>;
    if (status === 'cancelled') return <Badge variant="secondary">Cancelled</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Bookings & Transactions</CardTitle>
          <CardDescription>Overview of all bookings processed through the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold">{totalBookings}</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Gross Revenue</p>
                <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Platform Fees Earned</p>
                <p className="text-3xl font-bold">${totalPlatformFees.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Seeker</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Platform Fee</TableHead>
                  <TableHead className="text-right">Provider Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bookings yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {booking.createdAt?.toDate
                          ? format(booking.createdAt.toDate(), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{booking.seekerName}</TableCell>
                      <TableCell className="text-sm">{booking.providerName}</TableCell>
                      <TableCell>{statusBadge(booking.status, booking.chargebackStatus)}</TableCell>
                      <TableCell className="text-right font-mono">${(booking.totalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">${(booking.platformFeeAmount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">${(booking.providerNetPayout || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {hasMore && bookings.length > 0 && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchBookings(lastDoc)}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
