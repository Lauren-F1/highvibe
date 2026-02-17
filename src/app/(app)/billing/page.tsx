'use client';

import { useState, useMemo, useEffect, ReactNode, FC } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Download, Info, Landmark } from "lucide-react";
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

const invoices = [
    { id: 'SUB-001', date: 'July 30, 2024', description: 'Starter Guide Plan', amount: '$129.00' },
    { id: 'FEE-001', date: 'July 1, 2024', description: 'Success Fee (Andes Hiking)', amount: '$960.00' },
    { id: 'SUB-002', date: 'June 30, 2024', description: 'Starter Guide Plan', amount: '$129.00' },
];

type UserPlans = Record<UserRole, string>;

// --- REUSABLE BILLING COMPONENTS ---

interface PlanCardProps {
    plan: PlanTier;
    planKey: string;
    role: UserRole;
    isCurrent: boolean;
    isPendingDowngrade: boolean;
    onPlanChange: (role: UserRole, planKey: string) => void;
}

const PlanCard: FC<PlanCardProps> = ({ plan, planKey, role, isCurrent, isPendingDowngrade, onPlanChange }) => (
    <Card key={planKey} className={cn("flex flex-col", isCurrent && !isPendingDowngrade && "border-primary")}>
        <CardHeader className="p-6">
            <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
            {isCurrent && !isPendingDowngrade && (
                <Badge variant="secondary">Current</Badge>
            )}
            </div>
            <p className="text-3xl font-bold pt-4">${plan.price}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-6 flex-grow">
            <div>
            <p className="font-semibold text-base">{plan.platformFeePercent}% Platform Fee</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Applies to your line-item subtotal (excluding taxes). Stripe processing fees are deducted from your payout.</p>
            </div>
            <div className="space-y-1">
            <p className='text-sm font-semibold'>Visibility Level: <span className="font-normal">{plan.visibility}</span></p>
            <p className='text-sm font-semibold'>AI Assistant: <span className="font-normal">{plan.aiAssistant ? 'Yes' : 'No'}</span></p>
            </div>
            {plan.name.includes('Pro') && <p className="text-xs text-muted-foreground italic leading-relaxed">Includes a 90-day commitment.</p>}
            <ul className="space-y-3 text-sm text-muted-foreground pt-2">
            {plan.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary"/>
                <span className="leading-relaxed">{benefit}</span>
                </li>
            ))}
            </ul>
        </CardContent>
        <CardFooter className="p-6 pt-0 border-t mt-auto">
            <Button 
                className="w-full" 
                disabled={isCurrent && !isPendingDowngrade} 
                onClick={() => onPlanChange(role, planKey)}
                variant={isPendingDowngrade ? 'outline' : 'default'}
            >
                {isCurrent && !isPendingDowngrade ? 'Current Plan' : isPendingDowngrade ? 'Downgrade Pending' : 'Switch to ' + plan.name}
            </Button>
        </CardFooter>
    </Card>
);

interface ProviderBillingTabProps {
    role: UserRole;
    userPlans: UserPlans;
    pendingDowngrade: Partial<Record<UserRole, string>>;
    renewalDate: Date;
    proCommitmentEndDate: Date;
    onPlanChange: (role: UserRole, planKey: string) => void;
}

const ProviderBillingTab: FC<ProviderBillingTabProps> = ({ role, userPlans, pendingDowngrade, renewalDate, proCommitmentEndDate, onPlanChange }) => {
    const currentPlan = plans[role][userPlans[role]];
    return (
      <div className="mt-12 space-y-12">
        <Card>
            <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription className="leading-relaxed">Select the plan that best fits your needs as a {role}.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {Object.entries(plans[role]).map(([planKey, plan]) => (
                    <PlanCard
                        key={planKey}
                        plan={plan}
                        planKey={planKey}
                        role={role}
                        isCurrent={userPlans[role] === planKey}
                        isPendingDowngrade={pendingDowngrade[role] === planKey}
                        onPlanChange={onPlanChange}
                    />
                ))}
            </CardContent>
            <CardFooter className='p-6 flex-col items-start gap-4'>
                <div className="w-full">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-semibold">What is Priority Visibility?</p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6 leading-relaxed">
                        Your profile and listings appear higher in search results when seekers/guides/hosts are browsing, while still respecting relevance filters.
                    </p>
                </div>
                {role === 'host' &&
                    <div className="border-t w-full pt-4 mt-2 text-center">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Prefer not to subscribe? Pay-as-you-go lets you list with $0/mo and a higher fee only when you get booked.
                        </p>
                    </div>
                }
            </CardFooter>
        </Card>

         <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="plan-rules" className="border-b-0">
            <Card className="bg-secondary/30">
              <AccordionTrigger className="p-6 text-left hover:no-underline [&[data-state=open]]:border-b">
                <div className="flex w-full items-center justify-between">
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Plan Rules</h3>
                    <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                      Upgrades are immediate. Downgrades apply at renewal. Pro has a 90-day minimum.
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-6 pb-6 pt-0">
                  <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
                    <li className="leading-relaxed">Upgrades take effect immediately.</li>
                    <li className="leading-relaxed">Downgrades take effect on your next renewal date: <strong>{format(renewalDate, 'PPP')}</strong>.</li>
                    <li className="leading-relaxed">Pro plans have a 90-day minimum commitment.</li>
                    <li className="leading-relaxed">Re-upgrading to Pro within 60 days of downgrading triggers a one-time $99 reactivation fee.</li>
                    <li className="leading-relaxed">Platform fee rates are locked when a booking is paid.</li>
                    <li className="leading-relaxed">All payments must be processed through HighVibe via Stripe.</li>
                    {userPlans[role] === 'pro' && proCommitmentEndDate > new Date() && (
                      <li className="leading-relaxed">You can downgrade after: <strong>{format(proCommitmentEndDate, 'PPP')}</strong>.</li>
                    )}
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground leading-relaxed">Platform fees apply to your line-item subtotal (excluding taxes). Stripe processing fees are paid by the provider.</p>
                    <Button asChild variant="link" className="p-0 h-auto mt-2 text-xs">
                      <Link href="/terms">View full terms</Link>
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
        
        <div className="space-y-8">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-center">Your Billing Dashboard</h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Membership</CardTitle>
                        <CardDescription className="leading-relaxed">Your active plan and renewal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex flex-col gap-4 rounded-lg border bg-secondary/30 p-4">
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                    {currentPlan.name}
                                    <Badge variant={"default"}>Active</Badge>
                                </h3>
                                <p className="text-sm text-muted-foreground">{`Renews on ${format(renewalDate, 'PPP')}`}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">${currentPlan.price}/mo</p>
                            </div>
                            {pendingDowngrade[role] && (
                                    <p className="text-sm text-amber-600">
                                        Will downgrade to {plans[role][pendingDowngrade[role]!].name} on renewal date.
                                    </p>
                                )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch gap-2">
                        <Button variant="outline" className="w-full">Change plan</Button>
                        <Button variant="link" className="w-full">Manage membership</Button>
                    </CardFooter>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Payment Method</CardTitle>
                        <CardDescription className="leading-relaxed">Used to pay for your membership.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex items-center gap-4 rounded-lg border bg-secondary/30 p-4">
                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                            <div><p className="font-medium">Visa ending in 1234</p><p className="text-sm text-muted-foreground">On file</p></div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Update payment method</Button>
                    </CardFooter>
                </Card>
                    <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Payouts</CardTitle>
                        <CardDescription className="leading-relaxed">Used to receive earnings and payouts.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex items-center gap-4 rounded-lg border bg-secondary/30 p-4">
                            <Landmark className="h-8 w-8 text-muted-foreground" />
                            <div><p className="font-medium">Stripe Payouts</p><p className="text-sm text-muted-foreground">Not set up</p></div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Connect Stripe for payouts</Button>
                    </CardFooter>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Invoice History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-[40px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="py-4 text-muted-foreground">{invoice.date}</TableCell>
                                        <TableCell className="py-4"><p className="font-medium">{invoice.description}</p><p className="text-xs text-muted-foreground">{invoice.id}</p></TableCell>
                                        <TableCell className="py-4 text-right font-mono">{invoice.amount}</TableCell>
                                        <TableCell className="py-4"><Button variant="ghost" size="icon"><Download className="h-4 w-4" /><span className="sr-only">Download</span></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    );
}

// --- MAIN PAGE COMPONENT ---

export default function BillingPage() {
    const user = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [role, setRole] = useState<AllRoles>('seeker');
    const [userPlans, setUserPlans] = useState<UserPlans>({ guide: 'pro', host: 'starter', vendor: 'pay-as-you-go' });
    
    const [credit, setCredit] = useState<ManifestCredit | null>(null);
    const [loadingCredit, setLoadingCredit] = useState(true);

    // --- Subscription Guardrail State ---
    const [pendingDowngrade, setPendingDowngrade] = useState<Partial<Record<UserRole, string>>>({});
    const [showCommitmentModal, setShowCommitmentModal] = useState(false);
    const [showReactivationModal, setShowReactivationModal] = useState(false);
    const [upgradeToProModal, setUpgradeToProModal] = useState<{role: UserRole; planKey: string} | null>(null);
    const [downgradeModal, setDowngradeModal] = useState<{role: UserRole; planKey: string} | null>(null);
    
    // Simulate a user who upgraded to Pro recently and is in a commitment window.
    const proCommitmentEndDate = useMemo(() => add(new Date(), { days: 80 }), []);
    
    // Simulate a user who downgraded from Pro less than 60 days ago.
    const lastProDowngradeDate = useMemo(() => add(new Date(), { days: -30 }), []);
    
    const renewalDate = useMemo(() => add(new Date(), { days: 25 }), []);

    const upgradeToProCopy: Record<UserRole, {title: string; body: string}> = {
      guide: {
          title: "Upgrade to Pro",
          body: "Pro includes priority visibility and the AI Assistant to help you get matched faster and fill retreats more consistently.\n\nPro has a 90-day minimum commitment.\n\nUpgrades take effect immediately. Your new platform fee rate applies to bookings paid after this upgrade.\n\nAll payments must be processed through HighVibe via Stripe to qualify for Pro rates and protections."
      },
      host: {
          title: "Upgrade to Pro",
          body: "Pro includes priority visibility and the AI Assistant to help you get matched with Guides faster.\n\nPro has a 90-day minimum commitment.\n\nUpgrades take effect immediately. Your new platform fee rate applies to bookings paid after this upgrade.\n\nAll payments must be processed through HighVibe via Stripe to qualify for Pro rates and protections."
      },
      vendor: {
          title: "Upgrade to Pro",
          body: "Pro includes priority visibility and the AI Assistant to help you get matched faster and book more services.\n\nPro has a 90-day minimum commitment.\n\nUpgrades take effect immediately. Your new platform fee rate applies to bookings paid after this upgrade.\n\nAll payments must be processed through HighVibe via Stripe to qualify for Pro rates and protections."
      }
    }


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

        if (isDowngrade) {
            if (currentPlan.name.includes('Pro') && proCommitmentEndDate > new Date()) {
                setShowCommitmentModal(true);
                return;
            }
            setDowngradeModal({ role, planKey });
            return;
        }

        if (isUpgrade) {
            if (targetPlan.name.includes('Pro')) {
                // Simulating for 'host' role only for demonstration
                if (role === 'host' && lastProDowngradeDate && lastProDowngradeDate > add(new Date(), {days: -60})) {
                    setShowReactivationModal(true);
                    return;
                }
                setUpgradeToProModal({ role, planKey });
                return;
            } else {
                // Non-pro upgrade
                setUserPlans(prev => ({...prev, [role]: planKey}));
                toast({ title: "Upgrade Successful!", description: `You're now on the ${targetPlan.name} plan.` });
            }
        }
    }

    const handleUpgradeToProConfirm = () => {
        if (!upgradeToProModal) return;
        const { role, planKey } = upgradeToProModal;
        setUserPlans(prev => ({ ...prev, [role]: planKey }));
        setPendingDowngrade(prev => {
            const newPending = {...prev};
            delete newPending[role];
            return newPending;
        })
        toast({ title: "You’re on Pro.", description: "Priority visibility and AI Assistant are now active." });
        setUpgradeToProModal(null);
    }
    
    const handleDowngradeConfirm = () => {
        if (!downgradeModal) return;
        const { role, planKey } = downgradeModal;
        setPendingDowngrade(prev => ({ ...prev, [role]: planKey }));
        toast({
            title: "Downgrade Scheduled",
            description: `Downgrade scheduled for ${format(renewalDate, 'PPP')}. Your current plan remains active until then.`
        });
        setDowngradeModal(null);
    }

    if (user.status === 'loading') {
        return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
    }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight">HighVibe Retreats Partnership</h1>
            <p className="text-muted-foreground mt-2 text-lg leading-relaxed">Everything you need to build, connect, and get booked.</p>
             <Tabs value={role} onValueChange={(value) => setRole(value as AllRoles)} className="mt-6 w-full">
                <TabsList className={cn(
                    "grid w-full",
                    {
                        'grid-cols-1': !user.profile?.roles || user.profile.roles.length <= 1,
                        'grid-cols-2': user.profile?.roles?.length === 2,
                        'grid-cols-3': user.profile?.roles?.length === 3,
                        'grid-cols-4': user.profile?.roles?.length >= 4,
                    }
                )}>
                    {user.profile?.roles.includes('seeker') && <TabsTrigger value="seeker">Seeker</TabsTrigger>}
                    {user.profile?.roles.includes('guide') && <TabsTrigger value="guide">Guide</TabsTrigger>}
                    {user.profile?.roles.includes('host') && <TabsTrigger value="host">Host</TabsTrigger>}
                    {user.profile?.roles.includes('vendor') && <TabsTrigger value="vendor">Vendor</TabsTrigger>}
                </TabsList>
                 <TabsContent value="seeker" className="mt-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Your Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">Seeker</p>
                                <p className="font-medium text-primary">Free</p>
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Find and manifest retreats at no cost.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Manifest Credit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingCredit ? <p>Loading credit...</p> : credit ? (
                                    <>
                                        <p className="text-2xl font-bold">${credit.issued_amount.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">Expires on {format(credit.expiry_date.toDate(), 'PPP')}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold">$0.00</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">Manifest a retreat to earn credit for your next one.</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {(['guide', 'host', 'vendor'] as UserRole[]).map(providerRole => (
                    <TabsContent key={providerRole} value={providerRole}>
                        <ProviderBillingTab
                            role={providerRole}
                            userPlans={userPlans}
                            pendingDowngrade={pendingDowngrade}
                            renewalDate={renewalDate}
                            proCommitmentEndDate={proCommitmentEndDate}
                            onPlanChange={handlePlanChange}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
      </div>
      
      {/* --- Dialogs for Guardrails --- */}
       <AlertDialog open={showCommitmentModal} onOpenChange={setShowCommitmentModal}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Pro commitment active</AlertDialogTitle>
                    <AlertDialogDescription className="leading-relaxed">
                        Pro has a 90-day minimum commitment.
                        <br/><br/>
                        You can schedule a downgrade starting on: <strong>{format(proCommitmentEndDate, 'PPP')}</strong>.
                        <br/><br/>
                        Until then, your Pro benefits remain active.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setShowCommitmentModal(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showReactivationModal} onOpenChange={setShowReactivationModal}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reactivation fee applies</AlertDialogTitle>
                    <AlertDialogDescription className="leading-relaxed">
                        Because you downgraded from Pro within the last 60 days, a one-time $99 reactivation fee applies to upgrade back to Pro.
                        <br/><br/>
                        Your Pro minimum commitment restarts when you re-upgrade.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        setShowReactivationModal(false);
                        if(role !== 'seeker') setUserPlans(prev => ({...prev, [role]: 'pro'}));
                        toast({ title: "Reactivation fee applied.", description: "Welcome back to Pro." });
                    }}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!upgradeToProModal} onOpenChange={() => setUpgradeToProModal(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{upgradeToProModal ? upgradeToProCopy[upgradeToProModal.role].title : ''}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {upgradeToProModal ? <p className='whitespace-pre-line leading-relaxed'>{upgradeToProCopy[upgradeToProModal.role].body}</p> : ''}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpgradeToProConfirm}>
                        Upgrade to Pro
                    </AlertDialogAction>
                </AlertDialogFooter>
                 <div className="text-xs text-muted-foreground mt-2 leading-relaxed">By upgrading, you agree to the Pro minimum commitment and the plan rules in the Terms. <Button asChild variant="link" className="p-0 h-auto text-xs align-baseline"><Link href="/terms">View plan rules</Link></Button></div>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!downgradeModal} onOpenChange={() => setDowngradeModal(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Downgrade scheduled</AlertDialogTitle>
                     <AlertDialogDescription className="leading-relaxed">
                        Your downgrade will take effect on your next renewal date: <strong>{format(renewalDate, 'PPP')}</strong>.
                        <br/><br/>
                        Your current plan stays active until then.
                        <br/><br/>
                        Platform fee rates for existing bookings do not change after payment.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep current plan</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDowngradeConfirm}>
                        Confirm downgrade
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
