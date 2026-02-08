
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, BarChart, Users, DollarSign, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

import { placeholderImages } from '@/lib/placeholder-images';
import { PaywallModal } from '@/components/paywall-modal';
import { RequestConnectionModal } from '@/components/request-connection-modal';
import { vendors, type Vendor, matchingGuidesForVendor } from '@/lib/mock-data';
import { VendorCard } from '@/components/vendor-card';
import { VendorFilters, type VendorFiltersState } from '@/components/vendor-filters';
import { GuideCard, type Guide } from '@/components/guide-card';
import { GuideFilters, type GuideFiltersState } from '@/components/guide-filters';
import { enableGuideDiscovery, enableVendorDiscovery, isBuilderMode } from '@/firebase/config';
import { getDistanceInMiles } from '@/lib/geo';


const genericImage = placeholderImages.find(p => p.id === 'generic-placeholder')!;

const hostSpaces = [
  { id: 'space1', name: 'The Glass House', location: 'Topanga, California', capacity: 25, rate: 2200, status: 'Published', bookings: 3, image: placeholderImages.find(p => p.id === 'modern-event-space')!, hostLat: 34.09, hostLng: -118.6 },
  { id: 'space2', name: 'Sacred Valley Hacienda', location: 'Cusco, Peru', capacity: 18, rate: 1500, status: 'Published', bookings: 5, image: placeholderImages.find(p => p.id === 'spanish-villa-sunset')!, hostLat: -13.53, hostLng: -71.96 },
  { id: 'space3', name: 'Mountain View Lodge', location: 'Asheville, North Carolina', capacity: 40, rate: 3500, status: 'Draft', bookings: 0, image: placeholderImages.find(p => p.id === 'mountain-hike')!, hostLat: 35.59, hostLng: -82.55 },
];

const connectionRequests = [
    { id: 'cr1', name: 'Asha Sharma', role: 'Guide', forSpace: 'The Glass House', status: 'New Request' },
    { id: 'cr2', name: 'Local Caterers', role: 'Vendor', forSpace: 'The Glass House', status: 'Awaiting Response' }
];

const confirmedBookings = [
    { id: 'cb1', guideName: 'Marcus Green', retreatName: 'Adventure & Leadership Summit', forSpace: 'The Glass House', dates: 'Nov 5-10, 2024' }
];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const initialGuideFilters: GuideFiltersState = {
  experienceTypes: [],
  groupSize: 100,
  vibes: [],
  timing: 'anytime',
};

const initialVendorFilters: VendorFiltersState = {
  categories: [],
  locationPreference: 'local',
  budget: 5000,
  planningWindow: 'anytime',
  availabilityTypes: [],
  showNearMatches: false,
  showExactDates: false,
  radius: 50,
};


function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function HostPage() {
  const router = useRouter();
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(hostSpaces[0]?.id || null);
  const [isPaywallOpen, setPaywallOpen] = useState(false);
  const [connectionModal, setConnectionModal] = useState<{isOpen: boolean, name: string, role: 'Host' | 'Vendor' | 'Guide'}>({isOpen: false, name: '', role: 'Guide'});
  
  // Guide filter state
  const [guideFilters, setGuideFilters] = useState<GuideFiltersState>(initialGuideFilters);
  const [appliedGuideFilters, setAppliedGuideFilters] = useState<GuideFiltersState>(initialGuideFilters);
  const [guideSortOption, setGuideSortOption] = useState('recommended');
  
  // Vendor filter state
  const [vendorFilters, setVendorFilters] = useState<VendorFiltersState>(initialVendorFilters);
  const [appliedVendorFilters, setAppliedVendorFilters] = useState<VendorFiltersState>(initialVendorFilters);
  const [vendorSortOption, setVendorSortOption] = useState('recommended');

  const handleConnectClick = (name: string, role: 'Host' | 'Vendor' | 'Guide') => {
    setConnectionModal({ isOpen: true, name, role });
  }

  const handleAddNewSpace = () => {
      alert("Navigate to 'Add New Space' page.");
  }
  
  const activeSpace = hostSpaces.find(s => s.id === activeSpaceId);
  const spaceConnectionRequests = connectionRequests.filter(c => c.forSpace === activeSpace?.name);
  const spaceConfirmedBookings = confirmedBookings.filter(c => c.forSpace === activeSpace?.name);
  
  const handleGuideFilterChange = (newFilters: Partial<GuideFiltersState>) => {
    setGuideFilters(prev => ({...prev, ...newFilters}));
  };
  const handleApplyGuideFilters = () => {
    setAppliedGuideFilters(guideFilters);
  };
  const handleResetGuideFilters = () => {
    setGuideFilters(initialGuideFilters);
    setAppliedGuideFilters(initialGuideFilters);
  };
  
  const areGuideFiltersDefault = JSON.stringify(appliedGuideFilters) === JSON.stringify(initialGuideFilters);

  const displayedGuides = useMemo(() => {
    let filtered = [...matchingGuidesForVendor];
    
    if (!areGuideFiltersDefault) {
      if (appliedGuideFilters.experienceTypes.length > 0) {
        filtered = filtered.filter(guide => 
            guide.retreatTypes?.some(type => appliedGuideFilters.experienceTypes.includes(type))
        );
      }
      if (appliedGuideFilters.groupSize < 100) {
          filtered = filtered.filter(guide => (guide.upcomingRetreatsCount + 1) * 5 <= appliedGuideFilters.groupSize);
      }
      if (appliedGuideFilters.vibes.length > 0) {
          filtered = filtered.filter(guide =>
              guide.vibeTags?.some(tag => appliedGuideFilters.vibes.includes(tag))
          );
      }
    }
    
    switch (guideSortOption) {
      case 'rating':
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'newest':
         filtered.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
        break;
      case 'recommended':
      default:
         filtered.sort((a, b) => (b.premiumMembership ? 1 : 0) - (a.premiumMembership ? 1 : 0) || (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }
    
    if (areGuideFiltersDefault) {
      return filtered.slice(0, 6);
    }
    
    return filtered;
  }, [appliedGuideFilters, guideSortOption, areGuideFiltersDefault]);

  const handleVendorFilterChange = (newFilters: Partial<VendorFiltersState>) => {
    setVendorFilters(prev => ({...prev, ...newFilters}));
  };
  const handleApplyVendorFilters = () => {
    setAppliedVendorFilters(vendorFilters);
  };
  const handleResetVendorFilters = () => {
    setVendorFilters(initialVendorFilters);
    setAppliedVendorFilters(initialVendorFilters);
  };

  const displayedVendors = useMemo(() => {
    let filtered = [...vendors];
    const radius = appliedVendorFilters.radius;
    
    if (activeSpace?.hostLat && activeSpace.hostLng) {
      filtered = filtered.filter(vendor => {
          if (!vendor.vendorLat || !vendor.vendorLng) return vendor.location === 'Global' || vendor.location === 'Remote';
          const distance = getDistanceInMiles(activeSpace.hostLat!, activeSpace.hostLng!, vendor.vendorLat, vendor.vendorLng);
          const isInRadius = distance <= radius;

          if (vendor.vendorServiceRadiusMiles) {
            return isInRadius && distance <= vendor.vendorServiceRadiusMiles;
          }
          return isInRadius;
        });
    }

    if (appliedVendorFilters.categories.length > 0) {
        filtered = filtered.filter(vendor => appliedVendorFilters.categories.includes(vendor.category));
    }
    if (appliedVendorFilters.budget < 5000) {
        filtered = filtered.filter(vendor => vendor.startingPrice ? vendor.startingPrice <= appliedVendorFilters.budget : true);
    }
    
    switch (vendorSortOption) {
      case 'price-asc':
        filtered.sort((a, b) => (a.startingPrice || Infinity) - (b.startingPrice || Infinity));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
        break;
      case 'recommended':
      default:
        filtered.sort((a, b) => (b.premiumMembership ? 1 : 0) - (a.premiumMembership ? 1 : 0) || (b.luxApproved ? 1 : 0) - (a.luxApproved ? 1 : 0) || (a.startingPrice || Infinity) - (b.startingPrice || Infinity));
        break;
    }
    
    return filtered;

  }, [activeSpace, appliedVendorFilters, vendorSortOption]);
  
  const showGuideResults = isBuilderMode || (enableGuideDiscovery && matchingGuidesForVendor.length > 0);
  const showVendorResults = isBuilderMode || (enableVendorDiscovery && vendors.length > 0);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PaywallModal isOpen={isPaywallOpen} onOpenChange={setPaywallOpen} />
      <RequestConnectionModal 
        isOpen={connectionModal.isOpen} 
        onOpenChange={(val) => setConnectionModal({...connectionModal, isOpen: val})} 
        name={connectionModal.name} 
        role={connectionModal.role} 
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Host Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg font-body">Offer a space designed for retreat experiences.</p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0" onClick={handleAddNewSpace}>
          <PlusCircle className="mr-2 h-5 w-5" />
          List Your Space
        </Button>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Your Performance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Spaces" value="2" icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} description="Published and available" />
            <StatCard title="Guide Inquiries" value="+12" icon={<Users className="h-4 w-4 text-muted-foreground" />} description="in the last 30 days" />
            <StatCard title="Bookings" value="3" icon={<BarChart className="h-4 w-4 text-muted-foreground" />} description="in the last 90 days" />
            <StatCard title="Total Earnings" value="$45,231" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="All-time earnings" />
        </div>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Your Spaces</CardTitle>
          <CardDescription>Manage your property listings and availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]"></TableHead>
                <TableHead>Space</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-center">Upcoming Bookings</TableHead>
                <TableHead className="w-[200px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostSpaces.map((space) => (
                <TableRow key={space.id} className={activeSpaceId === space.id ? 'bg-accent' : ''} onClick={() => setActiveSpaceId(space.id)} style={{cursor: 'pointer'}}>
                  <TableCell>
                    <div className="relative h-12 w-16 rounded-md overflow-hidden bg-secondary">
                      <Image
                        src={space.image?.imageUrl || genericImage.imageUrl}
                        alt={space.image?.description || genericImage.description}
                        data-ai-hint={space.image?.imageHint || genericImage.imageHint}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{space.name}</p>
                    <p className="text-xs text-muted-foreground">{space.location}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={space.status === 'Published' ? 'default' : 'secondary'}>{space.status}</Badge>
                  </TableCell>
                  <TableCell>{space.capacity} guests</TableCell>
                  <TableCell className="text-right">${space.rate}/night</TableCell>
                  <TableCell className="text-center">{space.bookings}</TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); document.getElementById('partnership-dashboard')?.scrollIntoView({ behavior: 'smooth' }); }}>Partners Dashboard</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4"/></Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('Edit clicked')}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Manage availability clicked')}>Manage Availability</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Pause listing clicked')}>Pause Listing</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <div id="partnership-dashboard" className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Partnership Dashboard for {activeSpace ? `"${activeSpace.name}"` : 'Your Space'}</CardTitle>
                <CardDescription className="font-body text-base">Find the right guides and local vendors to partner with.</CardDescription>
                <div className="!mt-6 max-w-sm">
                    <Select onValueChange={setActiveSpaceId} value={activeSpaceId || ''}>
                        <SelectTrigger id="space-selector" className="text-lg py-6">
                            <SelectValue placeholder="Select a space to see matches..." />
                        </SelectTrigger>
                        <SelectContent>
                            {hostSpaces.map(space => (
                            <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {activeSpaceId ? (
                    <>
                        <div className="pt-4">
                            <Tabs defaultValue="guides">
                                <TabsList className="grid w-full grid-cols-2 bg-primary text-primary-foreground">
                                    <TabsTrigger value="guides">Guides (Retreat Leaders)</TabsTrigger>
                                    <TabsTrigger value="vendors">Vendors (Local Partners)</TabsTrigger>
                                </TabsList>
                                <TabsContent value="guides" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                        <div className="lg:col-span-1">
                                            <GuideFilters filters={guideFilters} onFiltersChange={handleGuideFilterChange} onApply={handleApplyGuideFilters} onReset={handleResetGuideFilters} />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div>
                                                <h3 className="font-headline text-2xl">Suggested Guides</h3>
                                                <p className="text-sm text-muted-foreground mt-1">A starting point. Refine with filters anytime.</p>
                                            </div>
                                            <div className="flex justify-between items-center mb-4 mt-4">
                                                {isBuilderMode && <p className="text-xs text-muted-foreground">Preview mode — sample listings.</p>}
                                                <div className="flex-grow"></div>
                                                <Select value={guideSortOption} onValueChange={setGuideSortOption}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Sort by" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="recommended">Recommended</SelectItem>
                                                        <SelectItem value="rating">Highest rated</SelectItem>
                                                        <SelectItem value="newest">Newest</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {displayedGuides.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {displayedGuides.map(guide => <GuideCard key={guide.id} guide={guide} onConnect={() => handleConnectClick(guide.name, 'Guide')} />)}
                                                </div>
                                            ) : (
                                                <Card className="text-center py-12">
                                                    <CardHeader><CardTitle className="font-headline text-xl">No matches for these filters yet.</CardTitle></CardHeader>
                                                    <CardContent><CardDescription>Try changing or resetting your filters.</CardDescription></CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="vendors" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                        <div className="lg:col-span-1">
                                        <VendorFilters 
                                            filters={vendorFilters} 
                                            onFiltersChange={handleVendorFilterChange}
                                            onApply={handleApplyVendorFilters}
                                            onReset={handleResetVendorFilters}
                                        />
                                        </div>
                                        <div className="lg:col-span-3">
                                        {activeSpace && (!activeSpace.hostLat || !activeSpace.hostLng) ? (
                                            <Card className="flex items-center justify-center text-center py-12 h-full">
                                                <p className="text-destructive text-sm max-w-xs">Add a location to this space to enable local vendor matching.</p>
                                            </Card>
                                        ) : (
                                            <div>
                                            <div>
                                                <h3 className="font-headline text-2xl">Suggested Vendors near {activeSpace?.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">Based on this property’s location. Refine with filters anytime.</p>
                                            </div>
                                            <div className="flex justify-between items-center mb-4 mt-4">
                                                {isBuilderMode && <p className="text-xs text-muted-foreground">Preview mode — sample listings.</p>}
                                                <div className="flex-grow"></div>
                                                <Select value={vendorSortOption} onValueChange={setVendorSortOption}>
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
                                            {displayedVendors.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {displayedVendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} onConnect={() => handleConnectClick(vendor.name, 'Vendor')} />)}
                                                </div>
                                            ) : (
                                                <Card className="text-center py-12">
                                                <CardHeader><CardTitle className="font-headline text-xl">No matches for these filters yet.</CardTitle></CardHeader>
                                                <CardContent><CardDescription>Try a different category or widening your filters.</CardDescription></CardContent>
                                                </Card>
                                            )}
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        
                        <Separator className="my-2" />

                        <div>
                            <h3 className="font-headline text-2xl mb-2">Connections Requested</h3>
                            <p className="text-muted-foreground mb-4">Connections you’ve initiated or received.</p>
                             {spaceConnectionRequests.length > 0 ? (
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
                                        {spaceConnectionRequests.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-medium">{req.name}</TableCell>
                                                <TableCell>{req.role}</TableCell>
                                                <TableCell><Badge variant={req.status === 'New Request' ? 'default' : 'secondary'}>{req.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => router.push('/inbox')}>View Message</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 rounded-lg bg-secondary/50">
                                    <p className="text-muted-foreground">No connection requests yet for this space.</p>
                                </div>
                            )}
                        </div>
                        
                        <Separator className="my-2" />

                        <div>
                            <h3 className="font-headline text-2xl mb-2">Confirmed Bookings</h3>
                            <p className="text-muted-foreground mb-4">These are your confirmed retreat relationships and bookings.</p>
                            {spaceConfirmedBookings.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Guide</TableHead>
                                            <TableHead>Retreat</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {spaceConfirmedBookings.map(booking => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">{booking.guideName}</TableCell>
                                                <TableCell>{booking.retreatName}</TableCell>
                                                <TableCell>{booking.dates}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" className="mr-2">View Details</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 rounded-lg bg-secondary/50">
                                    <p className="text-muted-foreground">No confirmed bookings yet. You're building momentum!</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Please select a space to see its partnership dashboard.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

    
