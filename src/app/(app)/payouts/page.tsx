'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { isFirebaseEnabled } from '@/firebase/config';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transfer {
  id: string;
  amount: number;
  currency: string;
  created: string;
  description: string;
}

function PayoutsContent() {
  const user = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const isConnected = user.profile?.stripeConnectOnboarded === true;
  const hasAccount = !!user.profile?.stripeConnectAccountId;
  const isPending = hasAccount && !isConnected;

  // Show toast based on URL params
  useEffect(() => {
    if (searchParams.get('connected') === '1') {
      toast({ title: 'Stripe Connected!', description: 'You can now receive payouts.' });
    } else if (searchParams.get('pending') === '1') {
      toast({ title: 'Verification Pending', description: 'Stripe is reviewing your account. This usually takes a few minutes.' });
    } else if (searchParams.get('reauth') === '1') {
      toast({ title: 'Onboarding Incomplete', description: 'Please complete your Stripe onboarding to receive payouts.', variant: 'destructive' });
    }
  }, []);

  // Fetch payout history
  useEffect(() => {
    if (user.status !== 'authenticated' || !isConnected) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        let idToken = '';
        if (isFirebaseEnabled && user.data && typeof (user.data as any).getIdToken === 'function') {
          idToken = await (user.data as any).getIdToken();
        }

        const res = await fetch('/api/stripe/payout-history', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTransfers(data.transfers || []);
        }
      } catch (e) {
        console.error('Error fetching payout history:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.status, isConnected]);

  const handleConnectStripe = async () => {
    if (user.status !== 'authenticated') return;
    setConnectLoading(true);

    try {
      let idToken = '';
      if (isFirebaseEnabled && user.data && typeof (user.data as any).getIdToken === 'function') {
        idToken = await (user.data as any).getIdToken();
      }

      const res = await fetch('/api/stripe/connect-onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to start onboarding');
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setConnectLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    if (user.status !== 'authenticated') return;
    setDashboardLoading(true);

    try {
      let idToken = '';
      if (isFirebaseEnabled && user.data && typeof (user.data as any).getIdToken === 'function') {
        idToken = await (user.data as any).getIdToken();
      }

      const res = await fetch('/api/stripe/connect-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error(data.error || 'Failed to open dashboard');
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setDashboardLoading(false);
    }
  };

  if (user.status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <h1 className="font-headline text-3xl font-bold mb-6">Payouts</h1>

      {/* Connect Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <><CheckCircle className="h-5 w-5 text-green-600" /> Stripe Connected</>
            ) : isPending ? (
              <><Clock className="h-5 w-5 text-yellow-600" /> Verification Pending</>
            ) : (
              <><AlertCircle className="h-5 w-5 text-muted-foreground" /> Connect Stripe</>
            )}
          </CardTitle>
          <CardDescription>
            {isConnected
              ? 'Your Stripe account is connected and ready to receive payouts from bookings.'
              : isPending
                ? 'Stripe is reviewing your account. This usually takes a few minutes.'
                : 'Connect your Stripe account to receive payouts when seekers book your retreats, spaces, or services.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <Button onClick={handleOpenDashboard} disabled={dashboardLoading}>
              {dashboardLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Manage Payout Settings
            </Button>
          ) : (
            <Button onClick={handleConnectStripe} disabled={connectLoading}>
              {connectLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? 'Continue Onboarding' : 'Connect Stripe'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>Recent transfers from retreat bookings</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {transfers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No payouts yet. Payouts appear here after seekers book your offerings.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell className="text-right font-medium">${t.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PayoutsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    }>
      <PayoutsContent />
    </Suspense>
  );
}
