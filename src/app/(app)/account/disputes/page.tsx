'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, add } from 'date-fns';

type DisputedBooking = {
    id: string;
    retreatId: string;
    retreatTitle?: string;
    totalAmount: number;
    chargebackStatus: string;
    chargebackStripeDisputeId?: string;
    chargebackEvidenceUrls?: string[];
    chargebackEvidenceNotes?: string;
    createdAt: any;
};

const statusBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    open: { label: 'Open', variant: 'destructive' },
    submitted: { label: 'Evidence Submitted', variant: 'secondary' },
    won: { label: 'Won', variant: 'default' },
    lost: { label: 'Lost', variant: 'outline' },
};

export default function DisputesPage() {
    const user = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [bookings, setBookings] = useState<DisputedBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [evidenceNotes, setEvidenceNotes] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);

    useEffect(() => {
        if (user.status !== 'authenticated' || !firestore) {
            setLoading(false);
            return;
        }

        const loadDisputes = async () => {
            try {
                // Query bookings where the current user is a provider with a chargeback
                const q = query(
                    collection(firestore, 'bookings'),
                    where('bookedEntityOwnerId', '==', user.data.uid),
                    where('chargebackStatus', 'in', ['open', 'submitted', 'won', 'lost'])
                );
                const snap = await getDocs(q);
                setBookings(snap.docs.map(d => ({
                    id: d.id,
                    ...d.data(),
                } as DisputedBooking)));
            } catch (err) {
                console.error('Error loading disputes:', err);
            }
            setLoading(false);
        };

        loadDisputes();
    }, [user.status, user.data?.uid, firestore]);

    const handleSubmitEvidence = async (bookingId: string) => {
        if (!firestore) return;

        setSubmitting(bookingId);
        try {
            const notes = evidenceNotes[bookingId] || '';
            if (!notes.trim()) {
                toast({ title: 'Please add evidence notes', variant: 'destructive' });
                setSubmitting(null);
                return;
            }

            await updateDoc(doc(firestore, 'bookings', bookingId), {
                chargebackStatus: 'submitted',
                chargebackEvidenceNotes: notes.trim(),
            });

            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, chargebackStatus: 'submitted', chargebackEvidenceNotes: notes.trim() } : b
            ));

            toast({ title: 'Evidence submitted', description: 'Our team will review your evidence.' });
        } catch (err) {
            console.error('Failed to submit evidence:', err);
            toast({ title: 'Error', description: 'Could not submit evidence.', variant: 'destructive' });
        } finally {
            setSubmitting(null);
        }
    };

    if (loading) {
        return <div className="container mx-auto px-4 py-12 text-center">Loading disputes...</div>;
    }

    const openDisputes = bookings.filter(b => b.chargebackStatus === 'open');
    const resolvedDisputes = bookings.filter(b => ['submitted', 'won', 'lost'].includes(b.chargebackStatus));

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
            <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">Disputes & Chargebacks</h1>
            <p className="text-muted-foreground mb-8">View and respond to payment disputes on your bookings.</p>

            {bookings.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="font-bold text-xl mb-2">No Disputes</h3>
                        <p className="text-muted-foreground">You have no active or past chargebacks. Keep up the great work!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {openDisputes.length > 0 && (
                        <>
                            <h2 className="font-headline text-xl flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" /> Action Required ({openDisputes.length})
                            </h2>
                            {openDisputes.map(booking => {
                                const badge = statusBadge[booking.chargebackStatus] || statusBadge.open;
                                const evidenceDeadline = booking.createdAt?.toDate
                                    ? format(add(booking.createdAt.toDate(), { days: 7 }), 'PPP')
                                    : '7 days from filing';

                                return (
                                    <Card key={booking.id} className="border-l-4 border-l-destructive">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">
                                                    Booking {booking.id.slice(0, 8)}...
                                                </CardTitle>
                                                <Badge variant={badge.variant}>{badge.label}</Badge>
                                            </div>
                                            <CardDescription>
                                                Amount: ${booking.totalAmount?.toLocaleString() || '—'} &middot; Evidence due by: {evidenceDeadline}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="bg-amber-50 p-4 rounded-lg text-sm">
                                                <p className="font-semibold mb-2">Submit evidence to support your case:</p>
                                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                                    <li>Signed contracts or agreements</li>
                                                    <li>Communication logs with the seeker</li>
                                                    <li>Proof of service delivery</li>
                                                    <li>Your refund/cancellation policy</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <Label>Evidence Notes</Label>
                                                <Textarea
                                                    placeholder="Describe your evidence and explain why this dispute should be resolved in your favor..."
                                                    value={evidenceNotes[booking.id] || ''}
                                                    onChange={e => setEvidenceNotes(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                                    rows={4}
                                                />
                                            </div>
                                            <Button
                                                onClick={() => handleSubmitEvidence(booking.id)}
                                                disabled={submitting === booking.id}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {submitting === booking.id ? 'Submitting...' : 'Submit Evidence'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </>
                    )}

                    {resolvedDisputes.length > 0 && (
                        <>
                            <h2 className="font-headline text-xl mt-8">Past Disputes ({resolvedDisputes.length})</h2>
                            {resolvedDisputes.map(booking => {
                                const badge = statusBadge[booking.chargebackStatus] || statusBadge.open;
                                return (
                                    <Card key={booking.id}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Booking {booking.id.slice(0, 8)}...</p>
                                                <p className="text-sm text-muted-foreground">${booking.totalAmount?.toLocaleString() || '—'}</p>
                                            </div>
                                            <Badge variant={badge.variant}>{badge.label}</Badge>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
