'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Download, PauseCircle, PlayCircle, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// --- DATA DEFINITIONS ---

type UserRole = 'guide' | 'host' | 'vendor';
type LuxStatus = 'Not Yet Reviewed' | 'Under Consideration' | 'LUX Certified';

type PlanTier = {
  name: string;
  price: number;
  benefits: string[];
  helperText?: string;
};

type RolePlans = {
  [key: string]: PlanTier;
};

const plans: Record<UserRole, RolePlans> = {
  guide: {
    partner: {
      name: 'Partner Guide',
      price: 199,
      benefits: [
        'Create and publish retreats',
        'Be discovered by aligned seekers',
        'Connect with hosts and vendors',
        'Smart matching for venues and experience partners',
        'In-app messaging and coordination',
        'Booking and retreat management tools',
        'Standard discovery placement',
        'Access to LUX consideration',
      ],
    },
    pro: {
      name: 'Pro Guide',
      price: 299,
      benefits: [
        'Get noticed faster with priority placement in discovery',
        'Increased visibility to high-intent seekers',
        'Priority matching with top hosts and vendors',
        'Featured retreat eligibility',
        'Advanced matching filters',
        'Performance insights on your retreats',
        'Priority support',
        'Stronger consideration weighting for LUX review',
      ],
      helperText: 'Built for guides who want more bookings, faster momentum, and greater visibility.',
    },
  },
  host: {
    partner: {
      name: 'Partner Host',
      price: 149,
      benefits: [
        'List your property as a retreat-ready space',
        'Be discovered by aligned guides',
        'Receive booking inquiries',
        'Smart matching to relevant retreats',
        'In-app messaging and booking coordination',
        'Standard discovery placement',
        'Access to LUX consideration',
      ],
    },
    premium: {
      name: 'Premium Host',
      price: 249,
      benefits: [
        'Get discovered faster by high-intent guides',
        'Priority placement in host discovery',
        'Featured venue eligibility',
        'Increased visibility for premium retreats',
        'Early access to top guides',
        'Enhanced profile presentation',
        'Priority matching for aligned experiences',
        'Stronger consideration weighting for LUX review',
      ],
      helperText: 'Built for hosts who want more bookings, better-fit retreats, and higher-quality partnerships.',
    },
  },
  vendor: {
    partner: {
      name: 'Partner Vendor',
      price: 49,
      benefits: [
        'Create a vendor profile and list your services',
        'Be discovered by guides and hosts',
        'Receive service inquiries',
        'Smart matching to relevant retreats',
        'In-app messaging and coordination',
        'Standard visibility in vendor discovery',
        'Access to LUX consideration',
      ],
    },
    premier: {
      name: 'Premier Vendor',
      price: 79,
      benefits: [
        'Get noticed faster with priority placement',
        'Increased visibility to Pro Guides and Premium Hosts',
        'Featured service eligibility',
        'Priority matching for high-value retreats',
        'Enhanced profile presentation',
        'Early access to premium opportunities',
        'Stronger consideration weighting for LUX review',
      ],
      helperText: 'Built for vendors who want more leads, higher-quality partnerships, and premium exposure.',
    },
  },
};

const invoices = [
    { id: 'SUB-001', date: 'July 30, 2024', description: 'Partner Guide', amount: '$199.00' },
    { id: 'FEE-001', date: 'July 1, 2024', description: 'Success Fee (Andes Hiking)', amount: '$750.00' },
    { id: 'FAC-001', date: 'June 25, 2024', description: 'Booking Facilitation Fee (#B123)', amount: '$200.00' },
    { id: 'SUB-002', date: 'June 30, 2024', description: 'Partner Guide', amount: '$199.00' },
];

type UserPlans = Record<UserRole, string>;

// --- MODAL COMPONENTS ---

const PauseModal = ({ isOpen, onOpenChange, onConfirm }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pause Your Subscription</DialogTitle>
                <DialogDescription>
                    Pausing will hide your profile and listings from discovery. Existing bookings remain intact. Your subscription will reactivate on the date you select.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <Label>When would you like to resume?</Label>
                <RadioGroup defaultValue="next-cycle">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="next-cycle" id="r1" />
                        <Label htmlFor="r1">Next billing cycle</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="30-days" id="r2" />
                        <Label htmlFor="r2">In 30 days</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="60-days" id="r3" />
                        <Label htmlFor="r3">In 60 days</Label>
                    </div>
                </RadioGroup>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={onConfirm}>Confirm Pause</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

const CancelModal = ({ isOpen, onOpenChange, onConfirm }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void }) => (
     <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. Your subscription will remain active until the end of the current billing period. All your data will be preserved if you choose to resubscribe later.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Cancel My Subscription
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

const UpgradeDowngradeModal = ({ isOpen, onOpenChange, onConfirm, currentPlan, targetPlan }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void, currentPlan?: PlanTier, targetPlan?: PlanTier }) => {
    if (!currentPlan || !targetPlan) return null;
    const isUpgrade = targetPlan.price > currentPlan.price;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isUpgrade ? 'Upgrade Your Plan' : 'Downgrade Your Plan'}</DialogTitle>
                    <DialogDescription>
                        Your new plan will take effect at the start of your next billing cycle.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>{currentPlan.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <p className="text-2xl font-bold">${currentPlan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                {currentPlan.benefits.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card className="border-primary">
                        <CardHeader>
                            <CardTitle>New Plan</CardTitle>
                            <CardDescription>{targetPlan.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">${targetPlan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                            <ul className="mt-4 space-y-2 text-sm text-primary">
                                {targetPlan.benefits.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                            {isUpgrade && targetPlan.helperText && <p className="mt-4 text-xs italic text-muted-foreground">{targetPlan.helperText}</p>}
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onConfirm}>Confirm {isUpgrade ? 'Upgrade' : 'Downgrade'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};


// --- MAIN PAGE COMPONENT ---

export default function BillingPage() {
    const [role, setRole] = useState<UserRole>('guide');
    const [userPlans, setUserPlans] = useState<UserPlans>({ guide: 'partner', host: 'partner', vendor: 'partner' });
    const [isPaused, setIsPaused] = useState(false);
    const [luxStatus] = useState<LuxStatus>('Under Consideration');
    const [luxRequested, setLuxRequested] = useState(false);

    const [modalState, setModalState] = useState<{ type: 'upgrade' | 'downgrade' | 'pause' | 'cancel' | null, isOpen: boolean }>({ type: null, isOpen: false });

    const currentTierKey = userPlans[role];
    const rolePlanTiers = Object.keys(plans[role]);
    const currentTierIndex = rolePlanTiers.indexOf(currentTierKey);
    const currentPlan = plans[role][currentTierKey];
    
    const nextTierKey = rolePlanTiers[currentTierIndex + 1];
    const prevTierKey = rolePlanTiers[currentTierIndex - 1];

    const upgradePlan = nextTierKey ? plans[role][nextTierKey] : undefined;
    const downgradePlan = prevTierKey ? plans[role][prevTierKey] : undefined;

    const handlePause = () => {
        setModalState({ type: 'pause', isOpen: false });
        setIsPaused(true);
    };
    const handleResume = () => setIsPaused(false);
    
    const handleCancel = () => {
        setModalState({ type: 'cancel', isOpen: false });
        alert('Your subscription has been cancelled.');
    }
    
    const handlePlanChange = (newTier: string) => {
        setUserPlans(prev => ({...prev, [role]: newTier }));
        setModalState({ type: null, isOpen: false });
    }


  return (
    <>
    <PauseModal isOpen={modalState.type === 'pause' && modalState.isOpen} onOpenChange={(val) => setModalState({ ...modalState, isOpen: val })} onConfirm={handlePause} />
    <CancelModal isOpen={modalState.type === 'cancel' && modalState.isOpen} onOpenChange={(val) => setModalState({ ...modalState, isOpen: val })} onConfirm={handleCancel} />
    {upgradePlan && <UpgradeDowngradeModal isOpen={modalState.type === 'upgrade' && modalState.isOpen} onOpenChange={(val) => setModalState({ ...modalState, isOpen: val })} onConfirm={() => handlePlanChange(nextTierKey)} currentPlan={currentPlan} targetPlan={upgradePlan} />}
    {downgradePlan && <UpgradeDowngradeModal isOpen={modalState.type === 'downgrade' && modalState.isOpen} onOpenChange={(val) => setModalState({ ...modalState, isOpen: val })} onConfirm={() => handlePlanChange(prevTierKey)} currentPlan={currentPlan} targetPlan={downgradePlan} />}

    <div className="container mx-auto px-4 py-8 md:py-12">
        {isPaused && (
            <Alert variant="default" className="mb-8 bg-secondary border-primary/50">
                <PlayCircle className="h-4 w-4" />
                <AlertTitle>Your Subscription is Paused</AlertTitle>
                <AlertDescription>
                    Your plan will not renew, and your profile is hidden. You can resume anytime to restore full access.
                </AlertDescription>
            </Alert>
        )}
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight">RETREAT Partnership</h1>
            <p className="text-muted-foreground mt-2 text-lg">Everything you need to build, connect, and get booked.</p>
             <Tabs value={role} onValueChange={(value) => setRole(value as UserRole)} className="mt-6 max-w-sm mx-auto">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="guide">Guide</TabsTrigger>
                    <TabsTrigger value="host">Host</TabsTrigger>
                    <TabsTrigger value="vendor">Vendor</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>


        {/* Section 1: Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Your active <span className="capitalize">{role}</span> subscription details and management options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-secondary/30">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        {currentPlan.name}
                        <Badge variant={isPaused ? 'secondary' : 'default'}>{isPaused ? 'Paused' : 'Active'}</Badge>
                    </h3>
                    <p className="text-muted-foreground">{isPaused ? 'Resumes upon request.' : 'Renews on July 30, 2027.'}</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                    <p className="text-2xl font-bold">${currentPlan.price}/mo</p>
                </div>
            </div>
            
            <p className="text-sm text-muted-foreground px-1">
                RETREAT is your platform partner in protecting your standards and preserving your margins, so you can focus on delivering experiences that actually matter.
            </p>

             <div className="space-y-2">
                <h4 className="font-semibold">Plan Management</h4>
                 <div className="flex flex-wrap gap-2">
                    {upgradePlan && <Button variant="default" size="lg" onClick={() => setModalState({ type: 'upgrade', isOpen: true })}>Upgrade Plan</Button>}
                    <Button variant="outline" onClick={() => setModalState({ type: 'cancel', isOpen: true })}>Cancel Subscription</Button>
                    {downgradePlan && <Button variant="outline" onClick={() => setModalState({ type: 'downgrade', isOpen: true })}>Downgrade Plan</Button>}
                    {isPaused ? (
                        <Button onClick={handleResume}><PlayCircle className="mr-2"/> Resume Subscription</Button>
                    ) : (
                        <Button variant="ghost" onClick={() => setModalState({ type: 'pause', isOpen: true })}><PauseCircle className="mr-2"/> Pause Subscription</Button>
                    )}
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: What Your Plan Includes */}
        <Card>
            <CardHeader>
                <CardTitle>What Your Plan Includes</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {currentPlan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0"/>
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        {/* Section 3: Platform Success Fees */}
        <Card>
            <CardHeader>
                <CardTitle>Platform Success Fees</CardTitle>
                 <CardDescription>RETREAT only wins when you win. Instead of taking a big cut upfront like most platforms, we keep the fee simple and small—so you keep more margin while we do the behind-the-scenes work that helps you get booked more often.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="text-base p-4 bg-secondary rounded-md space-y-2">
                    {role === 'host' ? (
                       <p>• <strong>2% platform fee</strong> on bookings confirmed through the platform.</p>
                    ) : role === 'guide' ? (
                       <p>• <strong>7.5% success fee</strong> charged on Day 1 of the retreat start date (only for retreats booked through RETREAT).</p>
                    ) : (
                       <p>• <strong>No transaction fees.</strong> Your subscription covers discovery, matching, and lead generation.</p>
                    )}
                 </div>
                 <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Visibility + distribution that brings you the right matches (not just more traffic)</li>
                    <li>• Matching tools that connect Guides, Hosts, and Vendors faster—with less back-and-forth</li>
                    <li>• Secure in-app messaging, booking flow, and coordination tools</li>
                    <li>• Trust & quality systems that keep the marketplace strong (reviews, reporting, and standards)</li>
                    <li>• Ongoing marketing that improves your future bookings over time</li>
                 </ul>
                 {role === 'guide' && (
                    <p className="text-xs text-muted-foreground pt-2">
                        Most platforms make money whether you get results or not. We keep the percentage modest so you can book more, run more retreats, and keep your margins strong.
                    </p>
                 )}
            </CardContent>
        </Card>

        {/* Section 4: LUX Status */}
        <Card>
            <CardHeader>
                 <CardTitle>LUX Experience Standard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    LUX is not an upgrade. It is not a tier. It is not something you can purchase.<br/>
                    LUX is an earned distinction, reserved for experiences that demonstrate exceptional care, quality, thoughtfulness, and delivery. It reflects not how expensive something is, but how intentionally it is designed and how consistently it exceeds expectations.<br/><br/>
                    Guides, Hosts, and Vendors may be quietly and periodically evaluated based on real experiences, participant feedback, operational excellence, and the overall integrity of what they deliver. When awarded, the LUX badge signals to seekers that this experience meets RETREAT’s highest standard of excellence.
                </p>
                 <div className="pt-2">
                    <Button onClick={() => setLuxRequested(true)} disabled={luxRequested} variant={luxRequested ? "secondary" : "default"}>
                        {luxRequested ? "Consideration Requested" : "Request LUX Consideration"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Requesting consideration does not guarantee LUX status. LUX recognition is granted through ongoing review of experience quality and delivery.</p>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <Card className="md:col-span-3">
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
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
                                    <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                                    <TableCell>
                                        <p className="font-medium">{invoice.description}</p>
                                        <p className="text-xs text-muted-foreground">{invoice.id}</p>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4" />
                                            <span className="sr-only">Download invoice</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
             <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Visa ending in 1234</p>
                            <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full">Update Payment Method</Button>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
    </>
  );
}
