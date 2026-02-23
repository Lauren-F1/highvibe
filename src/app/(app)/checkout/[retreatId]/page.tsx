'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { allRetreats } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

// This matches the entity in backend.json
interface ManifestCredit {
    id: string;
    seeker_id: string;
    manifestation_id: string;
    issued_amount: number;
    currency: string;
    issue_date: any; // Firestore Timestamp
    expiry_date: any; // Firestore Timestamp
    redeemed_amount?: number;
    redemption_booking_id?: string;
    redeemed_date?: any;
    status: 'available' | 'redeemed' | 'expired';
}

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const user = useUser();
    const firestore = useFirestore();

    const [retreat, setRetreat] = useState<(typeof allRetreats)[0] | null>(null);
    const [credit, setCredit] = useState<ManifestCredit | null>(null);
    const [applyCredit, setApplyCredit] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [liabilityAccepted, setLiabilityAccepted] = useState(false);

    const retreatId = params.id as string;

    useEffect(() => {
        if (user.status === 'authenticated' && user.profile && !user.profile.seekerAgreementAccepted) {
            router.push(`/seeker-agreement?redirect=/checkout/${retreatId}`);
        }
    }, [user.status, user.profile, router, retreatId]);

    useEffect(() => {
        const retreatData = allRetreats.find(r => r.id === retreatId);
        if (retreatData) {
            setRetreat(retreatData);
        }

        if (user.status === 'authenticated' && firestore) {
            const creditsRef = collection(firestore, 'manifest_credits');
            const q = query(
                creditsRef,
                where('seeker_id', '==', user.data.uid),
                where('status', '==', 'available')
            );
            
            getDocs(q).then(snapshot => {
                if (!snapshot.empty) {
                    const firstCreditDoc = snapshot.docs[0];
                    setCredit({ id: firstCreditDoc.id, ...firstCreditDoc.data() } as ManifestCredit);
                }
                setIsLoading(false);
            }).catch(err => {
                console.error("Error fetching credit:", err);
                setIsLoading(false);
            });
        } else if (user.status === 'unauthenticated') {
            setIsLoading(false);
        }

    }, [retreatId, user.status, firestore, user.data?.uid]);
    
    if (isLoading) {
        return <div className="container mx-auto px-4 py-12 text-center">Loading checkout...</div>;
    }

    if (!retreat) {
        notFound();
    }
    
    const creditAmount = credit?.issued_amount || 0;
    const retreatPackagePrice = retreat.price * 5; // e.g. 5 nights, mock package price
    const discount = applyCredit && credit ? Math.min(creditAmount, retreatPackagePrice) : 0;
    const total = retreatPackagePrice - discount;

    const handleConfirmBooking = async () => {
        if (user.status !== 'authenticated') {
            router.push(`/login?redirect=/checkout/${retreatId}`);
            return;
        }

        if (!firestore) {
            toast({ title: 'Error', description: 'Cannot connect to database.', variant: 'destructive' });
            return;
        }
        
        setIsProcessing(true);

        try {
            const batch = writeBatch(firestore);

            // Create Booking Doc
            const bookingRef = doc(collection(firestore, 'bookings'));
            const bookingData = {
                seekerId: user.data.uid,
                retreatId: retreat.id,
                manifestationId: credit?.manifestation_id || null, // Assuming credit is tied to manifestation
                createdAt: serverTimestamp(),
                totalAmount: total,
                currency: 'USD',
                lineItems: [
                    {
                        providerId: 'guide-placeholder-id', // Mock data
                        providerRole: 'guide',
                        description: retreat.title,
                        amount: retreatPackagePrice,
                        platformFeePctApplied: 0,
                        platformFeeAmount: 0,
                    }
                ],
                liabilityWaiverAccepted: true,
                liabilityWaiverAcceptedAt: serverTimestamp(),
                liabilityWaiverVersion: "v1.0-02-01-2026",
            };
            batch.set(bookingRef, bookingData);
    
            // Update Credit Doc (if applicable)
            if (applyCredit && credit) {
                const creditRef = doc(firestore, 'manifest_credits', credit.id);
                batch.update(creditRef, {
                    status: 'redeemed',
                    redeemed_amount: discount,
                    redemption_booking_id: bookingRef.id,
                    redeemed_date: serverTimestamp(),
                });
            }
    
            await batch.commit();

            toast({
                title: 'Booking Confirmed!',
                description: `You're all set for ${retreat.title}.`,
            });
            router.push('/seeker/manifestations');

        } catch (err) {
            console.error("Error confirming booking:", err);
            toast({
               title: 'Booking Failed',
               description: 'Could not complete your booking. Please try again.',
               variant: 'destructive'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Complete Your Booking</CardTitle>
                    <CardDescription>You're booking a spot for "{retreat.title}".</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Order Summary</h3>
                        <div className="flex justify-between">
                            <span>Retreat Package</span>
                            <span>${retreatPackagePrice.toFixed(2)}</span>
                        </div>
                        {credit && (
                            <>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="apply-credit">Apply Manifest Credit</Label>
                                         <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Credit is non-transferable and expires on {credit.expiry_date ? format(credit.expiry_date.toDate(), 'PPP') : 'N/A'}.</p>
                                                    <p>Applies to retreat booking subtotal only.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="font-medium text-primary">-${creditAmount.toFixed(2)}</span>
                                        <Switch
                                            id="apply-credit"
                                            checked={applyCredit}
                                            onCheckedChange={setApplyCredit}
                                            aria-label="Apply manifest credit"
                                        />
                                    </div>
                                </div>
                                {applyCredit && (
                                     <div className="flex justify-between text-primary">
                                        <span>Credit Applied</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </>
                        )}
                         <Separator />
                         <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                     <Separator />
                    <div className="space-y-3 pt-4">
                        <p className="text-sm text-muted-foreground">
                            Retreat participation involves travel, physical activity, and interaction with independent providers. By completing this booking, you acknowledge that HighVibe is a marketplace platform and not the retreat operator.
                        </p>
                        <div className="flex items-start space-x-2">
                            <Checkbox id="liability" checked={liabilityAccepted} onCheckedChange={(checked) => setLiabilityAccepted(checked as boolean)} />
                            <Label htmlFor="liability" className="text-sm font-normal text-muted-foreground leading-snug">
                                I have read and agree to the <Link href="/seeker-agreement" target="_blank" rel="noopener noreferrer" className="underline text-primary">Seeker Participation Agreement & Liability Waiver</Link>, understand that retreat participation involves inherent risks, and agree to binding arbitration under Nevada law.
                            </Label>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" size="lg" onClick={handleConfirmBooking} disabled={isProcessing || !liabilityAccepted}>
                        {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
