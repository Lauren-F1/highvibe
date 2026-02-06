
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Download, PauseCircle, PlayCircle, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type UserRole = 'guide' | 'host' | 'vendor';
type LuxStatus = 'Not Evaluated' | 'Under Consideration' | 'LUX Recognized';

const planDetails = {
  guide: {
    name: 'Guide Plan',
    price: 49,
    benefits: [
      'Unlimited retreat listings',
      'Advanced host & vendor matching',
      'Secure in-app messaging',
      'Discovery & featured placement eligibility',
      'Booking and retreat management tools',
    ],
    successFee: 'HighVibe charges a 7.5% platform facilitation fee on completed retreats that were booked through the platform.',
  },
  host: {
    name: 'Host Plan',
    price: 99,
    benefits: [
      'Unlimited space listings & discovery',
      'Intelligent matching with guides & vendors',
      'Seamless booking management',
      'Detailed profile visibility & analytics',
      'Tools to bundle services with local partners',
    ],
    successFee: 'HighVibe charges a 2% platform fee on bookings confirmed through the platform.',
  },
  vendor: {
    name: 'Vendor Plan',
    price: 29,
    benefits: [
      'Unlimited service listings & discovery',
      'Targeted matching with guides & hosts',
      'Qualified messaging & lead flow',
      'Enhanced profile visibility & reputation tools',
      'Partnership opportunities with local hosts',
    ],
    successFee: 'Vendors currently pay no transaction fee. Your subscription covers discovery, matching, and lead generation.',
  }
};

const invoices = [
    { id: 'SUB-001', date: 'June 30, 2024', description: 'Monthly Subscription', amount: '$49.00' },
    { id: 'FEE-001', date: 'June 25, 2024', description: 'Success Fee (Andes Hiking)', amount: '$720.00' },
    { id: 'SUB-002', date: 'May 30, 2024', description: 'Monthly Subscription', amount: '$49.00' },
    { id: 'SUB-003', date: 'April 30, 2024', description: 'Monthly Subscription', amount: '$49.00' },
  ];


export default function BillingPage() {
    const [role, setRole] = useState<UserRole>('guide');
    const [isPaused, setIsPaused] = useState(false);
    const [luxStatus] = useState<LuxStatus>('Under Consideration');

    const currentPlan = planDetails[role];

    const handlePause = () => {
        if (window.confirm(`Are you sure you want to pause your subscription? Your listings and profile will be hidden.`)) {
            setIsPaused(true);
        }
    }
    const handleResume = () => setIsPaused(false);


  return (
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
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
            <h1 className="font-headline text-4xl font-bold">Billing & Plan</h1>
            <p className="text-muted-foreground mt-2">Manage your subscription and see how your plan works.</p>
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
              Your active subscription details and management options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-secondary/30">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        {currentPlan.name}
                        <Badge variant={isPaused ? 'secondary' : 'default'}>{isPaused ? 'Paused' : 'Active'}</Badge>
                    </h3>
                    <p className="text-muted-foreground">{isPaused ? 'Resumes upon request.' : 'Renews on July 30, 2024.'}</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                    <p className="text-2xl font-bold">${currentPlan.price}/mo</p>
                </div>
            </div>

             <div className="space-y-2">
                <h4 className="font-semibold">Plan Management</h4>
                 <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Upgrade / Downgrade</Button>
                    {isPaused ? (
                        <Button onClick={handleResume}><PlayCircle className="mr-2"/> Resume Subscription</Button>
                    ) : (
                        <Button variant="ghost" onClick={handlePause}><PauseCircle className="mr-2"/> Pause Subscription</Button>
                    )}
                    <Button variant="destructive">Cancel Subscription</Button>
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
                    {currentPlan.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start">
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
                 <CardDescription>These fees support discovery, matching, infrastructure, trust systems, and platform growth.</CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-base p-4 bg-secondary rounded-md">{currentPlan.successFee}</p>
            </CardContent>
        </Card>

        {/* Section 4: LUX Status */}
        <Card>
            <CardHeader>
                 <CardTitle>LUX Experience Standard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">LUX is an earned distinction, not a paid upgrade. Like Michelin stars, LUX recognition is awarded based on the quality, thoughtfulness, and excellence of the experience delivered. Hosts, Guides, and Vendors may be quietly evaluated over time. If selected, the LUX badge will appear on your profile and listings.</p>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                         <Star className="h-6 w-6 text-primary"/>
                         <div>
                            <p className="font-semibold">Current LUX Status</p>
                            <p className="text-muted-foreground">{luxStatus}</p>
                         </div>
                    </div>
                    <Badge variant="outline">LUX cannot be purchased</Badge>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
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
                                    <TableCell className="text-muted-foreground">{invoice.date.split(',')[0]}</TableCell>
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
             <Card>
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
  );
}
