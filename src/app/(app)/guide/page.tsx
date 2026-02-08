'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { HostCard } from '@/components/host-card';
import { VendorCard } from '@/components/vendor-card';
import { HostFilters } from '@/components/host-filters';
import { VendorFilters } from '@/components/vendor-filters';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { placeholderImages } from '@/lib/placeholder-images';

const genericImage = placeholderImages.find(p => p.id === 'generic-placeholder')!;

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

  const handleViewMatchesClick = (retreatId: string) => {
    setActiveRetreatId(retreatId);
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
          <p className="text-muted-foreground mt-2 text-lg font-body">Design and lead meaningful retreat experiences.</p>
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
          <CardDescription>A summary of your created retreats. Select one to find matches below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>Retreat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Total Income</TableHead>
                <TableHead className="w-[200px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yourRetreats.map((retreat) => (
                <TableRow key={retreat.id} className={activeRetreatId === retreat.id ? 'bg-accent' : ''}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-secondary">
                      <Image
                        src={retreat.image?.imageUrl || genericImage.imageUrl}
                        alt={retreat.image?.description || genericImage.description}
                        data-ai-hint={retreat.image?.imageHint || genericImage.imageHint}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{retreat.name}</TableCell>
                  <TableCell>
                    <Badge variant={retreat.status === 'Published' ? 'default' : 'secondary'}>{retreat.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{retreat.bookings}</TableCell>
                  <TableCell className="text-right">${retreat.income.toLocaleString()}</TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewMatchesClick(retreat.id); }}>Find Partners</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4"/></Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('Edit clicked')}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Duplicate clicked')}>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Unpublish clicked')}>Unpublish</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => alert('Delete clicked')}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        <SelectTrigger id="retreat-selector" className="text-lg py-6">
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
                        <TabsList className="grid w-full grid-cols-2 bg-primary text-primary-foreground">
                            <TabsTrigger value="hosts">Hosts (Spaces)</TabsTrigger>
                            <TabsTrigger value="vendors">Vendors (Services)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="hosts" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-1">
                                    <HostFilters />
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-headline text-2xl">{hosts.length} Matching {hosts.length === 1 ? 'Space' : 'Spaces'}</h3>
                                        <Select defaultValue="recommended">
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="recommended">Recommended</SelectItem>
                                                <SelectItem value="price-asc">Price (low to high)</SelectItem>
                                                <SelectItem value="price-desc">Price (high to low)</SelectItem>
                                                <SelectItem value="rating">Highest rated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                     <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-headline text-2xl">{vendors.length} Matching {vendors.length === 1 ? 'Vendor' : 'Vendors'}</h3>
                                        <Select defaultValue="recommended">
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="recommended">Recommended</SelectItem>
                                                <SelectItem value="price-asc">Price (low to high)</SelectItem>
                                                <SelectItem value="price-desc">Price (high to low)</SelectItem>
                                                <SelectItem value="rating">Highest rated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                     </div>
                                     <p className="text-muted-foreground mb-4">Find the people who elevate the experience.</p>
                                    {vendors.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {vendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} onConnect={() => handleConnectClick(vendor.name, 'Vendor')} />)}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 rounded-lg bg-secondary/50">
                                            <p className="text-muted-foreground max-w-md mx-auto">
                                                We’re expanding this network. If you don’t see the perfect match yet, we’ll surface new vendors as they join.
                                            </p>
                                        </div>
                                    )}
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
