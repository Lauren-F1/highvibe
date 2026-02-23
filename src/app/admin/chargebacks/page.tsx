
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, add } from 'date-fns';
import { ImageUpload } from '@/components/image-upload';

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
  // Assuming provider info is fetched separately for now
  providerName?: string;
};

// Mock data to simulate fetching from Firestore
const mockBookings: Booking[] = [
    { 
        id: 'bk_1a2b3c', 
        seekerId: 'user_seeker_01',
        totalAmount: 2500,
        currency: 'USD',
        createdAt: Timestamp.fromDate(add(new Date(), {days: -10})),
        chargebackStatus: 'open',
        lineItems: [{ providerId: 'user_guide_01', description: 'Andes Retreat' }],
        providerName: 'Asha Sharma'
    },
     { 
        id: 'bk_4d5e6f', 
        seekerId: 'user_seeker_02',
        totalAmount: 4800,
        currency: 'USD',
        createdAt: Timestamp.fromDate(add(new Date(), {days: -5})),
        chargebackStatus: 'open',
        lineItems: [{ providerId: 'user_host_01', description: 'Bali Villa Stay' }],
        providerName: 'Ubud Jungle Haven'
    },
];


export default function ChargebackManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [chargebacks, setChargebacks] = useState<Booking[]>(mockBookings); // Using mock data
  const [loading, setLoading] = useState(true);
  const [selectedChargeback, setSelectedChargeback] = useState<Booking | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);

  // NOTE: The data fetching logic is commented out because we are using mock data.
  // In a real implementation, you would enable this.
  /*
  useEffect(() => {
    const fetchChargebacks = async () => {
      if (!firestore) return;
      setLoading(true);

      const chargebacksQuery = query(
        collection(firestore, 'bookings'),
        where('chargebackStatus', '==', 'open')
      );

      try {
        const snapshot = await getDocs(chargebacksQuery);
        const data = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
        } as Booking));
        
        // This is inefficient and for demonstration only.
        // In a real app, provider details might be denormalized or fetched more efficiently.
        for (const booking of data) {
            if (booking.lineItems.length > 0) {
                const providerId = booking.lineItems[0].providerId;
                const userSnap = await getDoc(doc(firestore, 'users', providerId));
                if (userSnap.exists()) {
                    booking.providerName = userSnap.data().displayName;
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
    
    // fetchChargebacks();
    setLoading(false); // Using mock data, so set loading to false
  }, [firestore, toast]);
  */
 useEffect(() => { setLoading(false) }, []);

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

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Chargeback Management</CardTitle>
            <CardDescription>Review and manage open payment disputes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Evidence Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Loading disputes...</TableCell></TableRow>
                  ) : chargebacks.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center">No open disputes found.</TableCell></TableRow>
                  ) : (
                    chargebacks.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.providerName || 'Unknown Provider'}</TableCell>
                        <TableCell>${item.totalAmount.toFixed(2)} {item.currency}</TableCell>
                        <TableCell>{evidenceDeadline(item.createdAt)}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="outline" onClick={() => setSelectedChargeback(item)}>Manage</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {selectedChargeback && (
        <Dialog open={!!selectedChargeback} onOpenChange={() => setSelectedChargeback(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Dispute Details: #{selectedChargeback.id}</DialogTitle>
                    <DialogDescription>
                        Review evidence and resolve the dispute for ${selectedChargeback.totalAmount.toFixed(2)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">Evidence from Provider ({selectedChargeback.providerName})</h4>
                        <Card className="p-4 bg-secondary">
                             <ImageUpload
                                value={evidenceFiles}
                                onChange={(urls) => setEvidenceFiles(urls as string[])}
                                storagePath={`chargebacks/${selectedChargeback.id}/`}
                                multiple
                                maxFiles={5}
                            />
                            <p className="text-xs text-muted-foreground mt-2">Placeholder: In a real app, this would be a secure file upload system for contracts, logs, etc.</p>
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
