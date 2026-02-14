'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Download, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { format, add } from 'date-fns';
import { cn } from '@/lib/utils';
import appConfig from '@/config/app.json';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// --- DATA DEFINITIONS ---

type UserRole = 'guide' | 'host' | 'vendor';
type AllRoles = UserRole | 'seeker';

interface ManifestCredit {
    id: string;
    seeker_id: string;
    manifestation_id: string;
    issued_amount: number;
    currency: string;
    issue_date: Timestamp; 
    expiry_date: Timestamp; 
    redeemed_amount?: number;
    redemption_booking_id?: string;
    redeemed_date?: Timestamp;
    status: 'available' | 'redeemed' | 'expired';
}

type PlanTier = {
  name: string;
  price: number;
  platformFeePercent: number;
  benefits: string[];
  helperText?: string;
  visibility: 'Standard' | 'Priority';
  aiAssistant: boolean;
};

type RolePlans = {
  [key: string]: PlanTier;
};

const plans: Record<UserRole, RolePlans> = appConfig.plans as any;

const feeDescriptions: Record<UserRole, string> = {
    guide: 'success fee of the Guide line-item subtotal, charged on Day 1 of the retreat.',
    host: 'platform fee of the Host line-item subtotal on confirmed bookings.',
    vendor: 'platform fee of the Vendor line-item subtotal on booked services.'
};

const invoices = [
    { id: 'SUB-001', date: 'July 30, 2024', description: 'Starter Guide Plan', amount: '$129.00' },
    { id: 'FEE-001', date: 'July 1, 2024', description: 'Success Fee (Andes Hiking)', amount: '$960.00' },
    { id: 'SUB-002', date: 'June 30, 2024', description: 'Starter Guide Plan', amount: '$129.00' },
];

type UserPlans = Record<UserRole, string>;

// --- MAIN PAGE COMPONENT ---

export default function BillingPage() {
    const user = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [role, setRole] = useState<AllRoles>('seeker');
    const [userPlans, setUserPlans] = useState<UserPlans>({ guide: 'pro', host: 'starter', vendor: 'pay-as-you-go' });
    const [isPaused, setIsPaused] = useState(false);
    
    const [credit, setCredit] = useState<ManifestCredit | null>(null);
    const [loadingCredit, setLoadingCredit] = useState(true);

    // --- Subscription Guardrail State Simulation ---
    const [showCommitmentModal, setShowCommitmentModal] = useState(false);
    const [showReactivationModal, setShowReactivationModal] = useState(false);
    const [pendingDowngrade, setPendingDowngrade] = useState<Partial<Record<UserRole, string>>>({});
    
    // Simulate a user who upgraded to Pro recently and is in a commitment window.
    const proCommitmentEndDate = useMemo(() => add(new Date(), { days: 80 }), []);
    
    // Simulate a user who downgraded from Pro less than 60 days ago.
    const lastProDowngradeDate = useMemo(() => add(new Date(), { days: -30 }), []);
    
    const renewalDate = useMemo(() => add(new Date(), { days: 25 }), []);


    useEffect(() => {
        if (user.status === 'authenticated' && user.profile) {
            setRole(user.profile.primaryRole || user.profile.roles[0] || 'seeker');
        }
    }, [user.status, user.profile]);

    useEffect(() => {
        if (role === 'seeker' && user.status === 'authenticated' && firestore) {
            setLoadingCredit(true);
            const creditsRef = collection(firestore, 'manifest_credits');
            const q = query(creditsRef, where('seeker_id', '==', user.data.uid), where('status', '==', 'available'));
            getDocs(q).then(snapshot => {
                if (!snapshot.empty) {
                    setCredit({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ManifestCredit);
                } else {
                    setCredit(null);
                }
                setLoadingCredit(false);
            }).catch(err => {
                console.error("Error fetching credit:", err);
                setLoadingCredit(false);
            });
        }
    }, [role, user.status, firestore, user.data?.uid]);
    
    const handlePlanChange = (role: UserRole, planKey: string) => {
        const currentPlanKey = userPlans[role];
        const currentPlan = plans[role][currentPlanKey];
        const targetPlan = plans[role][planKey];

        const isUpgrade = targetPlan.price > currentPlan.price;
        const isDowngrade = targetPlan.price < currentPlan.price;

        // --- Downgrade from Pro Logic ---
        if (isDowngrade && currentPlan.name.includes('Pro')) {
            if (proCommitmentEndDate > new Date()) {
                setShowCommitmentModal(true);
                return;
            }
            setPendingDowngrade(prev => ({...prev, [role]: planKey}));
            toast({ title: "Downgrade Scheduled", description: `Your plan will switch to ${targetPlan.name} on your next renewal date.` });
            return;
        }

        // --- Re-upgrade to Pro Logic ---
        if (isUpgrade && targetPlan.name.includes('Pro') && lastProDowngradeDate && lastProDowngradeDate > add(new Date(), {days: -60})) {
            // Check if this role was recently downgraded
            if (role === 'host') { // Simulating this only for the host role
                setShowReactivationModal(true);
                return;
            }
        }
        
        // --- Immediate Upgrade Logic ---
        if (isUpgrade) {
             setUserPlans(prev => ({...prev, [role]: planKey}));
             toast({ title: "Upgrade Successful!", description: `You're now on the ${targetPlan.name} plan.` });
        } else {
            // Non-pro downgrades
            setPendingDowngrade(prev => ({...prev, [role]: planKey}));
            toast({ title: "Downgrade Scheduled", description: `Your plan will switch to ${targetPlan.name} on your next renewal date.` });
        }
    }


    if (user.status === 'loading') {
        return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
    }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight">HighVibe Retreats Partnership</h1>
            <p className="text-muted-foreground mt-2 text-lg">Everything you need to build, connect, and get booked.</p>
             <Tabs value={role} onValueChange={(value) => setRole(value as AllRoles)} className="mt-6 max-w-lg mx-auto">
                <TabsList className={cn("grid w-full", `grid-cols-${user.profile?.roles.length || 1}`)}>
                    {user.profile?.roles.includes('seeker') && <TabsTrigger value="seeker">Seeker</TabsTrigger>}
                    {user.profile?.roles.includes('guide') && <TabsTrigger value="guide">Guide</TabsTrigger>}
                    {user.profile?.roles.includes('host') && <TabsTrigger value="host">Host</TabsTrigger>}
                    {user.profile?.roles.includes('vendor') && <TabsTrigger value="vendor">Vendor</TabsTrigger>}
                </TabsList>
                 <TabsContent value="seeker" className="mt-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">Seeker</p>
                                <p className="font-medium text-primary">Free</p>
                                <p className="text-sm text-muted-foreground mt-2">Find and manifest retreats at no cost.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Manifest Credit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingCredit ? <p>Loading credit...</p> : credit ? (
                                    <>
                                        <p className="text-2xl font-bold">${credit.issued_amount.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">Expires on {format(credit.expiry_date.toDate(), 'PPP')}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold">$0.00</p>
                                        <p className="text-sm text-muted-foreground">Manifest a retreat to earn credit for your next one.</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {(['guide', 'host', 'vendor'] as UserRole[]).map(providerRole => (
                    <TabsContent key={providerRole} value={providerRole} className="mt-12">
                        <div className='space-y-8'>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Choose Your Plan</CardTitle>
                                    <CardDescription>Select the plan that best fits your needs as a {providerRole}.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-3 gap-6 items-start">
                                    {Object.entries(plans[providerRole]).map(([planKey, plan]) => {
                                        const isCurrent = userPlans[providerRole] === planKey;
                                        const isPendingDowngrade = pendingDowngrade[providerRole] === planKey;
                                        
                                        return (
                                            <Card key={planKey} className={cn("flex flex-col h-full", isCurrent && !isPendingDowngrade && "border-primary ring-2 ring-primary")}>
                                                <CardHeader>
                                                    <CardTitle>{plan.name}</CardTitle>
                                                    <p className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                                </CardHeader>
                                                <CardContent className="space-y-4 flex-grow">
                                                    <div>
                                                        <p className="font-semibold">{plan.platformFeePercent}% Platform Fee</p>
                                                        <p className="text-xs text-muted-foreground">Applies to your line-item subtotal (excluding taxes). Stripe processing fees are deducted from your payout.</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className='text-sm font-semibold'>Visibility Level: <span className="font-normal">{plan.visibility}</span></p>
                                                        <p className='text-sm font-semibold'>AI Assistant: <span className="font-normal">{plan.aiAssistant ? 'Yes' : 'No'}</span></p>
                                                    </div>
                                                     {plan.name.includes('Pro') && <p className="text-xs text-muted-foreground italic">Includes a 90-day commitment.</p>}
                                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                                        {plan.benefits.map((benefit, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary"/>
                                                                <span>{benefit}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button 
                                                        className="w-full" 
                                                        disabled={isCurrent && !isPendingDowngrade} 
                                                        onClick={() => handlePlanChange(providerRole, planKey)}
                                                        variant={isPendingDowngrade ? 'outline' : 'default'}
                                                    >
                                                        {isCurrent && !isPendingDowngrade ? 'Current Plan' : isPendingDowngrade ? 'Downgrade Pending' : 'Switch to ' + plan.name}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        )
                                    })}
                                </CardContent>
                                <CardFooter className='flex-col items-start'>
                                     <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold">What is Priority Visibility?</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground pl-6">
                                        Your profile and listings appear higher in search results when seekers/guides/hosts are browsing, while still respecting relevance filters.
                                    </p>
                                </CardFooter>
                            </Card>

                             <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="plan-rules" className="border-b-0">
                                <Card className="bg-secondary/30">
                                  <AccordionTrigger className="p-6 text-left hover:no-underline [&[data-state=open]]:border-b">
                                    <div className="flex w-full items-center justify-between">
                                      <div className="text-left">
                                        <h3 className="font-semibold text-lg">Plan Rules</h3>
                                        <p className="text-sm text-muted-foreground font-normal">
                                          Upgrades are immediate. Downgrades apply at renewal. Pro has a 90-day minimum.
                                        </p>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="px-6 pb-6 pt-0">
                                      <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
                                        <li>Upgrades take effect immediately.</li>
                                        <li>Downgrades take effect on your next renewal date: <strong>{format(renewalDate, 'PPP')}</strong>.</li>
                                        <li>Pro plans have a 90-day minimum commitment.</li>
                                        <li>Re-upgrading to Pro within 60 days of downgrading triggers a one-time $99 reactivation fee.</li>
                                        <li>Platform fee rates are locked when a booking is paid.</li>
                                        <li>All payments must be processed through HighVibe via Stripe.</li>
                                        {userPlans[providerRole] === 'pro' && proCommitmentEndDate > new Date() && (
                                          <li>You can downgrade after: <strong>{format(proCommitmentEndDate, 'PPP')}</strong>.</li>
                                        )}
                                      </ul>
                                      <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs text-muted-foreground">Platform fees apply to your line-item subtotal (excluding taxes). Stripe processing fees are paid by the provider.</p>
                                        <Button asChild variant="link" className="p-0 h-auto mt-2 text-xs">
                                          <Link href="/terms">View full terms</Link>
                                        </Button>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </Card>
                              </AccordionItem>
                            </Accordion>

                             <Card>
                                <CardHeader>
                                    <CardTitle>Current Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-secondary/30">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                {plans[providerRole][userPlans[providerRole]].name}
                                                <Badge variant={isPaused ? 'secondary' : 'default'}>{isPaused ? 'Paused' : 'Active'}</Badge>
                                            </h3>
                                            <p className="text-muted-foreground">{isPaused ? 'Resumes upon request.' : `Renews on ${format(renewalDate, 'PPP')}`}</p>
                                            {pendingDowngrade[providerRole] && (
                                                <p className="text-sm text-amber-600 mt-1">
                                                    Will downgrade to {plans[providerRole][pendingDowngrade[providerRole]!].name} on renewal date.
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right mt-2 md:mt-0">
                                            <p className="text-2xl font-bold">${plans[providerRole][userPlans[providerRole]].price}/mo</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                <Card className="md:col-span-3">
                                    <CardHeader><CardTitle>Invoice History</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="border rounded-lg">
                                            <Table>
                                                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-[40px]"></TableHead></TableRow></TableHeader>
                                                <TableBody>{invoices.map((invoice) => (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                                                        <TableCell><p className="font-medium">{invoice.description}</p><p className="text-xs text-muted-foreground">{invoice.id}</p></TableCell>
                                                        <TableCell className="text-right font-mono">{invoice.amount}</TableCell>
                                                        <TableCell><Button variant="ghost" size="icon"><Download className="h-4 w-4" /><span className="sr-only">Download</span></Button></TableCell>
                                                    </TableRow>
                                                ))}</TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="md:col-span-2">
                                    <CardHeader><CardTitle>Payout Method</CardTitle><CardDescription>Connect your bank account to receive payouts.</CardDescription></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/30">
                                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                                            <div><p className="font-medium">Bank Account</p><p className="text-sm text-muted-foreground">Not Connected</p></div>
                                        </div>
                                        <Button variant="outline" className="w-full">Connect Bank Account</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
      </div>
      
      {/* --- Dialogs for Guardrails --- */}
       <AlertDialog open={showCommitmentModal} onOpenChange={setShowCommitmentModal}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Pro Plan Commitment</AlertDialogTitle>
                <AlertDialogDescription>
                    Pro plans have a 90-day minimum commitment. You can schedule your downgrade to take effect on{' '}
                    <strong>{format(proCommitmentEndDate, 'PPP')}.</strong>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowCommitmentModal(false)}>Got It</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showReactivationModal} onOpenChange={setShowReactivationModal}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Pro Reactivation Fee</AlertDialogTitle>
                <AlertDialogDescription>
                    Because you downgraded from a Pro plan within the last 60 days, a one-time reactivation fee of $99 will be charged to continue.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowReactivationModal(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        setShowReactivationModal(false);
                        // In a real app, this would trigger the Stripe payment flow
                        toast({ title: "Welcome back to Pro!", description: "The $99 reactivation fee has been charged." });
                        if(role !== 'seeker') setUserPlans(prev => ({...prev, [role]: 'pro'}));
                    }}>
                        Accept & Pay $99
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
