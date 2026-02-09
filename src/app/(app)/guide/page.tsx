'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { yourRetreats, hosts, vendors, UserSubscriptionStatus, destinations, connectionRequests, confirmedBookings } from '@/lib/mock-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { placeholderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { HostCard } from '@/components/host-card';
import { VendorCard } from '@/components/vendor-card';
import { HostFilters, type HostFiltersState } from '@/components/host-filters';
import { VendorFilters, type VendorFiltersState as VendorFiltersStateType } from '@/components/vendor-filters';
import { PartnershipStepper, type PartnershipStage } from '@/components/partnership-stepper';
import { NextBestAction } from '@/components/next-best-action';


const genericImage = placeholderImages.find(p => p.id === 'generic-placeholder')!;

const initialHostFilters: HostFiltersState = {
  continent: 'anywhere',
  region: '',
  planningWindow: 'anytime',
  flexibleDates: false,
  showNearMatches: false,
  showExactDates: false,
  budget: 20000,
  sleepingCapacity: 'any',
  eventCapacity: 'any',
  bedrooms: 'any',
  bathrooms: 'any',
  roomStyles: [],
  amenities: [],
  retreatReady: false,
  gatheringSpace: false,
  quietSetting: false,
  kitchen: 'any',
  policies: [],
  vibes: [],
};


export default function GuidePage() {
  const router = useRouter();
  const [activeRetreatId, setActiveRetreatId] = useState<string | null>(yourRetreats[0]?.id || null);
  const [subscriptionStatus] = useState<UserSubscriptionStatus>('active'); // mock status
  const { toast } = useToast();
  
  const [hostFilters, setHostFilters] = useState<HostFiltersState>(initialHostFilters);
  const [sortOption, setSortOption] = useState('recommended');


  const handleCreateRetreatClick = () => {
    router.push('/guide/retreats/new');
  };

  const handleViewPartnersClick = (retreatId: string) => {
    setActiveRetreatId(retreatId);
    const element = document.getElementById('partnership-dashboard');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleViewMessage = (threadId?: string) => {
    if (threadId) {
        router.push(`/inbox?c=${threadId}`);
    } else {
        router.push('/inbox');
        toast({
            title: 'Opening Inbox',
            description: 'Could not find a specific thread.',
        });
    }
  };

  const activeRetreat = yourRetreats.find(r => r.id === activeRetreatId);
  
  const retreatConnectionRequests = activeRetreat ? connectionRequests.filter(c => c.forRetreat === activeRetreat.name) : [];
  const retreatConfirmedBookings = activeRetreat ? confirmedBookings.filter(c => c.forRetreat === activeRetreat.name) : [];
  
  const getPartnershipStage = (retreat: (typeof yourRetreats)[0] | undefined, requests: typeof retreatConnectionRequests, bookings: typeof retreatConfirmedBookings): PartnershipStage => {
      if (!retreat) return 'Shortlist';
      if (retreat.status === 'Draft') return 'Draft';
      if (bookings.length > 0) return 'Confirmed';
      if (requests.some(r => r.status === 'Conversation Started')) return 'In Conversation';
      if (requests.length > 0) return 'Invites Sent';
      return 'Shortlist';
  };

  const partnershipStage = getPartnershipStage(activeRetreat, retreatConnectionRequests, retreatConfirmedBookings);


  const subscriptionBadge = {
      active: { variant: 'default', label: 'Active', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
      inactive: { variant: 'destructive', label: 'Inactive', icon: <XCircle className="mr-2 h-4 w-4" /> },
      past_due: { variant: 'destructive', label: 'Past Due', icon: <XCircle className="mr-2 h-4 w-4" /> },
      trial: { variant: 'secondary', label: 'Trial', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
  }[subscriptionStatus];
  
  const displayHosts = useMemo(() => {
    let filtered = [...hosts];

    // Location filtering
    if (hostFilters.continent !== 'anywhere') {
        if (hostFilters.region) {
            filtered = filtered.filter(host => host.location === hostFilters.region);
        } else {
            const regionsInContinent = destinations[hostFilters.continent] || [];
            filtered = filtered.filter(host => regionsInContinent.includes(host.location));
        }
    }
    
    // Budget filtering
    if(hostFilters.budget < 20000) {
      filtered = filtered.filter(host => host.pricePerNight <= hostFilters.budget);
    }

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'recommended':
         filtered.sort((a, b) => (b.luxApproved ? 1 : 0) - (a.luxApproved ? 1 : 0) || a.pricePerNight - b.pricePerNight);
        break;
      case 'rating':
        // Assuming no rating property, sorting by price descending as a stand-in
        filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      default:
        break;
    }

    return filtered;
  }, [hostFilters, sortOption]);

  const noHostsFound = displayHosts.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      
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
          <CardDescription>A summary of your created retreats. Select one to find partners below.</CardDescription>
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
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewPartnersClick(retreat.id); }}>Find Partners</Button>
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

      <div id="partnership-dashboard">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Partnership Dashboard for {activeRetreat ? `"${activeRetreat.name}"` : 'Your Retreat'}</CardTitle>
                <CardDescription className="font-body text-base">The right people, in the right place—without the back-and-forth.</CardDescription>
                <div className="!mt-6 max-w-sm">
                    <Select onValueChange={setActiveRetreatId} value={activeRetreatId || ''}>
                        <SelectTrigger id="retreat-selector" className="text-lg py-6">
                            <SelectValue placeholder="Select a retreat to see matches..." />
                        </SelectTrigger>
                        <SelectContent>
                            {yourRetreats.map(retreat => (
                            <SelectItem key={retreat.id} value={retreat.id}>{retreat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {activeRetreat ? (
                    <>
                        <div className="space-y-6">
                            <PartnershipStepper currentStage={partnershipStage} />
                            <NextBestAction stage={partnershipStage} />
                        </div>
                        <Separator />
                        
                        {/* Matches Available */}
                        <div>
                            <Tabs defaultValue="hosts">
                                <TabsList className="grid w-full grid-cols-2 bg-primary text-primary-foreground h-auto">
                                    <TabsTrigger value="hosts" className="text-base py-2.5">Hosts (Spaces)</TabsTrigger>
                                    <TabsTrigger value="vendors" className="text-base py-2.5">Vendors (Services)</TabsTrigger>
                                </TabsList>
                                <TabsContent value="hosts" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                        <div className="lg:col-span-1">
                                            <HostFilters filters={hostFilters} onFiltersChange={(newFilters) => setHostFilters(prev => ({...prev, ...newFilters}))} />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-headline text-2xl">{displayHosts.length} potential {displayHosts.length === 1 ? 'space' : 'spaces'} found</h3>
                                                <p className="text-xs text-muted-foreground">Counts update as you filter.</p>
                                                <Select value={sortOption} onValueChange={setSortOption}>
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
                                            {noHostsFound ? (
                                                <Card className="text-center py-12">
                                                    <CardHeader>
                                                        <CardTitle className="font-headline text-2xl mb-2">No spaces match these filters yet.</CardTitle>
                                                        <CardDescription>
                                                            Try widening location, budget, or timeframe. You can also turn on "Show near matches" to see more options.
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <form onSubmit={(e) => { e.preventDefault(); alert('You will be notified!'); }}>
                                                            <Card className="mt-8 text-left bg-secondary/50 max-w-sm mx-auto">
                                                                <CardHeader>
                                                                    <CardTitle className="text-xl">Get notified when matches appear</CardTitle>
                                                                    <CardDescription>
                                                                    We’ll only reach out when something matches what you’re looking for.
                                                                    </CardDescription>
                                                                </CardHeader>
                                                                <CardContent className="space-y-4">
                                                                    <div className="space-y-2">
                                                                    <Label htmlFor="email-notify">Email Address</Label>
                                                                    <Input id="email-notify" type="email" placeholder="you@example.com" required />
                                                                    </div>
                                                                </CardContent>
                                                                <CardFooter>
                                                                    <Button type="submit" className="w-full">Notify Me</Button>
                                                                </CardFooter>
                                                            </Card>
                                                        </form>
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {displayHosts.map(host => <HostCard key={host.id} host={host} />)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="vendors" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                        <div className="lg:col-span-1">
                                            <VendorFilters onApply={()=>{}} onReset={()=>{}} isDirty={false} onFiltersChange={()=>{}} filters={{} as VendorFiltersStateType} />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-headline text-2xl">{vendors.length} potential {vendors.length === 1 ? 'vendor' : 'vendors'} found</h3>
                                                <p className="text-xs text-muted-foreground">Counts update as you filter.</p>
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
                                            {vendors.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {vendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} />)}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 rounded-lg bg-secondary/50">
                                                    <p className="text-muted-foreground max-w-md mx-auto">We’re expanding this network. If you don’t see the perfect match yet, we’ll surface new vendors as they join.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        
                        <Separator />

                        {/* Connections Requested */}
                        <div>
                            <h3 className="font-headline text-2xl mb-2">Connections Requested</h3>
                            <p className="text-muted-foreground mb-4">Connections you’ve initiated or received.</p>
                             {retreatConnectionRequests.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {retreatConnectionRequests.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-medium">{req.name}</TableCell>
                                                <TableCell>{req.role}</TableCell>
                                                <TableCell><Badge variant={req.status === 'Conversation Started' ? 'default' : 'secondary'}>{req.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleViewMessage(req.id)}>View Message</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 rounded-lg bg-secondary/50">
                                    <p className="text-muted-foreground">No connection requests yet for this retreat.</p>
                                </div>
                            )}
                        </div>
                        
                        <Separator />

                        {/* Confirmed Bookings */}
                        <div>
                            <h3 className="font-headline text-2xl mb-2">Confirmed Bookings</h3>
                            <p className="text-muted-foreground mb-4">These are your confirmed retreat relationships and bookings.</p>
                            {retreatConfirmedBookings.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Partner</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {retreatConfirmedBookings.map(booking => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">{booking.partnerName}</TableCell>
                                                <TableCell>{booking.role}</TableCell>
                                                <TableCell>{booking.dates}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" className="mr-2">Manage</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 rounded-lg bg-secondary/50">
                                    <p className="text-muted-foreground">Nothing confirmed just yet. This is the space where aligned partnerships become official. Once details are finalized, confirmed bookings will appear here.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Please select a retreat to see its partnership dashboard.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    