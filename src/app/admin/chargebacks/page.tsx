
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format, add } from 'date-fns';
import { ImageUpload } from '@/components/image-upload';
import { Loader2 } from 'lucide-react';

// This is a placeholder for the actual Booking type
// In a real app, this would be imported from a shared types file
type Booking = {
  id: string;
  seekerId: string;
  totalAmount: number;
  currency: string;
  createdAt: Timestamp;
  chargebackStatus: 'open' | 'submitted' | 'won' | 'lost';
  lineItems: { providerId: string, description: string }[];
  chargebackEvidenceNotes?: string;
  chargebackDeducted?: boolean;
  providerName?: string;
};

export default function ChargebackManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [chargebacks, setChargebacks] = useState<Booking[]>([]);
  const [resolvedChargebacks, setResolvedChargebacks] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChargeback, setSelectedChargeback] = useState<Booking | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchChargebacks = async () => {
      if (!firestore) {
        setLoading(false);
        return;
      }

      try {
        // Fetch open/submitted disputes
        const chargebacksQuery = query(
          collection(firestore, 'bookings'),
          where('chargebackStatus', 'in', ['open', 'submitted'])
        );

        // Also fetch resolved disputes
        const resolvedQuery = query(
          collection(firestore, 'bookings'),
          where('chargebackStatus', 'in', ['won', 'lost'])
        );

        const [activeSnap, resolvedSnap] = await Promise.all([
          getDocs(chargebacksQuery),
          getDocs(resolvedQuery),
        ]);

        const resolvedData = resolvedSnap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
        for (const booking of resolvedData) {
          if (booking.lineItems?.length > 0) {
            const providerId = booking.lineItems[0].providerId;
            if (providerId) {
              try {
                const userSnap = await getDoc(doc(firestore, 'users', providerId));
                if (userSnap.exists()) booking.providerName = userSnap.data().displayName;
              } catch {}
            }
          }
        }
        setResolvedChargebacks(resolvedData);

        const data = activeSnap.docs.map(d => ({
            id: d.id,
            ...d.data(),
        } as Booking));

        for (const booking of data) {
            if (booking.lineItems?.length > 0) {
                const providerId = booking.lineItems[0].providerId;
                if (providerId) {
                    try {
                        const userSnap = await getDoc(doc(firestore, 'users', providerId));
                        if (userSnap.exists()) {
                            booking.providerName = userSnap.data().displayName;
                        }
                    } catch {
                        // Provider lookup failed, continue with unknown
                    }
                }
            }
        }

        setChargebacks(data);
      } catch (error) {
        console.error("Error fetching chargebacks:", error);
        toast({
            variant: "destructive",
            title: "Failed to fetch chargebacks",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChargebacks();
  }, [firestore, toast]);

  const handleUpdateStatus = async (chargebackId: string, status: 'won' | 'lost' | 'submitted') => {
    if (!firestore) return;
    try {
      const docRef = doc(firestore, 'bookings', chargebackId);
      await updateDoc(docRef, { chargebackStatus: status });
      
      setChargebacks(prev => prev.filter(c => c.id !== chargebackId));
      setSelectedChargeback(null);
      
      toast({ title: `Dispute marked as ${status}.` });

      if (status === 'lost') {
        toast({ description: "Payout deduction logic would be triggered here." });
      }

    } catch (error) {
      console.error("Error updating chargeback status:", error);
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const evidenceDeadline = (createdAt: Timestamp) => {
      return format(add(createdAt.toDate(), { days: 7 }), 'PPP');
  }

  const renderTable = (items: Booking[], showActions: boolean) => (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{showActions ? 'Evidence Deadline' : 'Offset'}</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow><TableCell colSpan={showActions ? 6 : 5} className="text-center py-8 text-muted-foreground">No disputes found.</TableCell></TableRow>
          ) : (
            items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell className="font-medium">{item.providerName || 'Unknown Provider'}</TableCell>
                <TableCell>${item.totalAmount?.toFixed(2)} {item.currency}</TableCell>
                <TableCell>
                  <Badge variant={item.chargebackStatus === 'won' ? 'default' : item.chargebackStatus === 'lost' ? 'destructive' : 'secondary'}>
                    {item.chargebackStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {showActions
                    ? evidenceDeadline(item.createdAt)
                    : item.chargebackDeducted ? 'Deducted' : '—'}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <Button variant="outline" onClick={() => setSelectedChargeback(item)}>Manage</Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Chargeback Management</CardTitle>
            <CardDescription>Review and manage payment disputes.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
            ) : (
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active ({chargebacks.length})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved ({resolvedChargebacks.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  {renderTable(chargebacks, true)}
                </TabsContent>
                <TabsContent value="resolved">
                  {renderTable(resolvedChargebacks, false)}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
      
      {selectedChargeback && (
        <Dialog open={!!selectedChargeback} onOpenChange={() => setSelectedChargeback(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Dispute Details: #{selectedChargeback.id}</DialogTitle>
                    <DialogDescription>
                        Review evidence and resolve the dispute for ${selectedChargeback.totalAmount.toFixed(2)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    {selectedChargeback.chargebackEvidenceNotes && (
                      <div>
                        <h4 className="font-semibold mb-2">Provider&apos;s Evidence Notes</h4>
                        <Card className="p-4 bg-muted">
                          <p className="text-sm whitespace-pre-wrap">{selectedChargeback.chargebackEvidenceNotes}</p>
                        </Card>
                      </div>
                    )}
                    <div>
                        <h4 className="font-semibold mb-2">Evidence Files ({selectedChargeback.providerName})</h4>
                        <Card className="p-4 bg-secondary">
                             <ImageUpload
                                value={evidenceFiles}
                                onChange={(urls) => setEvidenceFiles(urls as string[])}
                                storagePath={`chargebacks/${selectedChargeback.id}/`}
                                multiple
                                maxFiles={5}
                            />
                            <p className="text-xs text-muted-foreground mt-2">Upload supporting documents: contracts, communication logs, proof of service delivery.</p>
                        </Card>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Admin Actions</h4>
                        <p className="text-sm text-muted-foreground mb-4">After reviewing the evidence and the bank's decision, mark the dispute as won or lost.</p>
                        <div className="flex gap-4">
                            <Button variant="destructive" onClick={() => handleUpdateStatus(selectedChargeback.id, 'lost')}>Mark as Lost</Button>
                            <Button variant="default" onClick={() => handleUpdateStatus(selectedChargeback.id, 'won')}>Mark as Won</Button>
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">Marking as "Lost" will trigger a deduction from the provider's future payouts.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedChargeback(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
