'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { yourRetreats, hosts, vendors, UserSubscriptionStatus } from '@/lib/mock-data';
import { PaywallModal } from '@/components/paywall-modal';
import { RequestConnectionModal } from '@/components/request-connection-modal';
import { HostCard, Host } from '@/components/host-card';
import { VendorCard } from '@/components/vendor-card';
import type { Vendor } from '@/lib/mock-data';

// --- Filter Components ---

function HostFilters() {
    return (
        <div className="p-4 border rounded-lg space-y-4">
             <h3 className="font-headline text-lg font-semibold">Filter Spaces</h3>
            {/* Add filter controls here: Sliders, Checkboxes, etc. */}
            <p className="text-sm text-muted-foreground">Host filters coming soon.</p>
        </div>
    )
}

function VendorFilters() {
    return (
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-headline text-lg font-semibold">Filter Services</h3>
            <p className="text-sm text-muted-foreground">Vendor filters coming soon.</p>
        </div>
    )
}

// --- Main Dashboard Page ---

export default function GuidePage() {
  const router = useRouter();
  const [activeRetreatId, setActiveRetreatId] = useState<string | null>(yourRetreats[0]?.id || null);
  const [subscriptionStatus] = useState<UserSubscriptionStatus>('active'); // mock status
  const [isPaywallOpen, setPaywallOpen] = useState(false);
  const [connectionModal, setConnectionModal] = useState<{isOpen: boolean, name: string, role: 'Host' | 'Vendor'}>({isOpen: false, name: '', role: 'Host'});

  const handleCreateRetreatClick = () => {
    if (subscriptionStatus === 'active') {
      router.push('/guide/retreats/new');
    } else {
      setPaywallOpen(true);
    }
  };

  const handleMatchMeClick = (retreatId: string) => {
    setActiveRetreatId(retreatId);
    // smoothly scroll to the matches section
    document.getElementById('matches-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  const handleConnectClick = (name: string, role: 'Host' | 'Vendor') => {
     if (subscriptionStatus !== 'active') {
        setPaywallOpen(true);
        return;
    }
    setConnectionModal({ isOpen: true, name, role });
  }

  const activeRetreat = yourRetreats.find(r => r.id === activeRetreatId);
  const subscriptionBadge = {
      active: { variant: 'default', label: 'Active', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
      inactive: { variant: 'destructive', label: 'Inactive', icon: <XCircle className="mr-2 h-4 w-4" /> },
      past_due: { variant: 'destructive', label: 'Past Due', icon: <XCircle className="mr-2 h-4 w-4" /> },
      trial: { variant: 'secondary', label: 'Trial', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
  }[subscriptionStatus];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PaywallModal isOpen={isPaywallOpen} onOpenChange={setPaywallOpen} />
      <RequestConnectionModal isOpen={connectionModal.isOpen} onOpenChange={(val) => setConnectionModal({...connectionModal, isOpen: val})} name={connectionModal.name} role={connectionModal.role} />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Guide Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg font-body">Build retreats. Get matched. Book the right people.</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
             <Badge variant={subscriptionBadge.variant} className="h-9">
                {subscriptionBadge.icon}
                {subscriptionBadge.label}
             </Badge>
            <Button size="lg" onClick={handleCreateRetreatClick}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Retreat
            </Button>
        </div>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Your Retreats</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retreat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Total Income</TableHead>
                <TableHead className="w-[200px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yourRetreats.map((retreat) => (
                <TableRow key={retreat.id} className="cursor-pointer" onClick={() => router.push(`/guide/retreats/${retreat.id}`)}>
                  <TableCell className="font-medium">{retreat.name}</TableCell>
                  <TableCell>
                    <Badge variant={retreat.status === 'Published' ? 'default' : 'secondary'}>{retreat.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{retreat.bookings}</TableCell>
                  <TableCell className="text-right">${retreat.income.toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleMatchMeClick(retreat.id); }}>Match me</Button>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div id="matches-section">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Matches for Your Retreat</CardTitle>
                <CardDescription className="font-body text-base">The right people, in the right place—without the back-and-forth.</CardDescription>
                <div className="!mt-6 max-w-sm">
                    <Select onValueChange={setActiveRetreatId} value={activeRetreatId || ''}>
                        <SelectTrigger id="retreat-selector">
                            <SelectValue placeholder="Select a retreat to find matches..." />
                        </SelectTrigger>
                        <SelectContent>
                            {yourRetreats.map(retreat => (
                            <SelectItem key={retreat.id} value={retreat.id}>{retreat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {activeRetreat ? (
                     <Tabs defaultValue="hosts">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="hosts">Hosts (Spaces)</TabsTrigger>
                            <TabsTrigger value="vendors">Vendors (Services)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="hosts" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-1">
                                    <HostFilters />
                                </div>
                                <div className="lg:col-span-3">
                                    <h3 className="font-headline text-2xl mb-2">Recommended for you</h3>
                                    <p className="text-muted-foreground mb-4">Spaces that hold the vibe.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {hosts.slice(0, 4).map(host => <HostCard key={host.id} host={host} onConnect={() => handleConnectClick(host.name, 'Host')} />)}
                                    </div>
                                    <hr className="my-8" />
                                    <h3 className="font-headline text-2xl mb-4">Search & Filter</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {hosts.map(host => <HostCard key={host.id} host={host} onConnect={() => handleConnectClick(host.name, 'Host')} />)}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="vendors" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-1">
                                    <VendorFilters />
                                </div>
                                <div className="lg:col-span-3">
                                     <h3 className="font-headline text-2xl mb-2">Recommended for you</h3>
                                     <p className="text-muted-foreground mb-4">The details that make it unforgettable.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {vendors.slice(0, 3).map(vendor => <VendorCard key={vendor.id} vendor={vendor} onConnect={() => handleConnectClick(vendor.name, 'Vendor')} />)}
                                    </div>
                                     <hr className="my-8" />
                                    <h3 className="font-headline text-2xl mb-4">Search & Filter</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {vendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} onConnect={() => handleConnectClick(vendor.name, 'Vendor')} />)}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Please select a retreat to see matches.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
