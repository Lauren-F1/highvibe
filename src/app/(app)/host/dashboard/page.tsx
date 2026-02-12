
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, BarChart, Users, DollarSign, Briefcase, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

import { placeholderImages } from '@/lib/placeholder-images';
import { vendors as allVendors, type Vendor, matchingGuidesForVendor as allGuides } from '@/lib/mock-data';
import { VendorCard } from '@/components/vendor-card';
import { VendorFilters, type VendorFiltersState } from '@/components/vendor-filters';
import { GuideCard, type Guide } from '@/components/guide-card';
import { GuideFilters, type GuideFiltersState } from '@/components/guide-filters';
import { getDistanceInMiles } from '@/lib/geo';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { SpaceReadinessChecklist, type SpaceReadinessProps } from '@/components/space-readiness-checklist';
import { cn } from '@/lib/utils';


const genericImage = placeholderImages.find(p => p.id === 'generic-placeholder')!;

const hostSpaces = [
  { id: 'space1', name: 'The Glass House', location: 'Topanga, California', capacity: 25, rate: 2200, status: 'Published', bookings: 3, image: placeholderImages.find(p => p.id === 'modern-event-space')!, hostLat: 34.09, hostLng: -118.6,
    description: 'A stunning modern home with panoramic views, perfect for intimate workshops and corporate offsites.',
    amenities: ['Pool', 'Wi-Fi', 'A/C', 'Full kitchen onsite'],
    propertyShowcaseUrls: Array(6).fill(placeholderImages.find(p => p.id === 'modern-event-space')!.imageUrl),
    availabilitySet: true,
  },
  { id: 'space2', name: 'Sacred Valley Hacienda', location: 'Cusco, Peru', capacity: 18, rate: 1500, status: 'Published', bookings: 5, image: placeholderImages.find(p => p.id === 'spanish-villa-sunset')!, hostLat: -13.53, hostLng: -71.96,
    description: 'A historic hacienda in the heart of the Andes, offering a unique blend of culture and comfort.',
    amenities: [], // Incomplete
    propertyShowcaseUrls: Array(4).fill(placeholderImages.find(p => p.id === 'spanish-villa-sunset')!.imageUrl), // Incomplete
    availabilitySet: true,
  },
  { id: 'space3', name: 'Mountain View Lodge', location: 'Asheville, North Carolina', capacity: 40, rate: 0, status: 'Draft', bookings: 0, image: placeholderImages.find(p => p.id === 'mountain-hike')!, hostLat: 35.59, hostLng: -82.55,
    description: '', // Incomplete
    amenities: [], // Incomplete
    propertyShowcaseUrls: [], // Incomplete
    availabilitySet: false, // Incomplete
  },
];

const initialConnectionRequests = [
    { id: 'cr1', partnerId: 'g1', name: 'Asha Sharma', role: 'Guide' as const, forSpace: 'The Glass House', status: 'New Request' as const },
    { id: 'cr2', partnerId: 'v1', name: 'Elena Ray', role: 'Vendor' as const, forSpace: 'The Glass House', status: 'Awaiting Response' as const }
];

const initialConfirmedBookings = [
    { id: 'cb1', partnerId: 'g2', guideName: 'Marcus Green', retreatName: 'Adventure & Leadership Summit', forSpace: 'The Glass House', dates: 'Nov 5-10, 2024', partnerRole: 'Guide' as const }
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

export type ConnectionStatus = 'Not Connected' | 'Connection Requested' | 'New Request' | 'In Conversation' | 'Confirmed' | 'Booked' | 'Declined';


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

export default function HostDashboardPage() {
  const router = useRouter();
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(hostSpaces[0]?.id || null);
  
  const [activeTab, setActiveTab] = useState<'guides' | 'vendors'>('guides');

  const [connectionRequests, setConnectionRequests] = useState(initialConnectionRequests);
  const [confirmedBookings, setConfirmedBookings] = useState(initialConfirmedBookings);

  // Guide filter state
  const [guideFilters, setGuideFilters = useState<GuideFiltersState>(initialGuideFilters);
  const [appliedGuideFilters, setAppliedGuideFilters = useState<GuideFiltersState>(initialGuideFilters);
  const [guideSortOption, setGuideSortOption = useState('recommended');
  const [guideFiltersDirty, setGuideFiltersDirty = useState(false);
  const [guideFiltersVisible, setGuideFiltersVisible = useState(false);
  
  // Vendor filter state
  const [vendorFilters, setVendorFilters = useState<VendorFiltersState>(initialVendorFilters);
  const [appliedVendorFilters, setAppliedVendorFilters = useState<VendorFiltersState>(initialVendorFilters);
  const [vendorSortOption, setVendorSortOption = useState('recommended');
  const [vendorFiltersDirty, setVendorFiltersDirty = useState(false);
  const [vendorFiltersVisible, setVendorFiltersVisible = useState(false);
  
  const { toast } = useToast();
  const currentUser = useUser();
  const firestore = useFirestore();
  const [isConnecting, setIsConnecting] = useState(false);

  const appliedGuideFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedGuideFilters.experienceTypes.length > 0) count++;
    if (appliedGuideFilters.groupSize < 100) count++;
    if (appliedGuideFilters.vibes.length > 0) count++;
    if (appliedGuideFilters.timing !== 'anytime') count++;
    return count;
  }, [appliedGuideFilters]);

  const appliedVendorFiltersCount = useMemo(() => {
      let count = 0;
      const initial = initialVendorFilters;
      if (appliedVendorFilters.categories.length > 0) count++;
      if (appliedVendorFilters.locationPreference !== initial.locationPreference) count++;
      if (appliedVendorFilters.budget < initial.budget) count++;
      if (appliedVendorFilters.planningWindow !== initial.planningWindow) count++;
      if (appliedVendorFilters.availabilityTypes.length > 0) count++;
      if (appliedVendorFilters.showNearMatches) count++;
      if (appliedVendorFilters.showExactDates) count++;
      if (appliedVendorFilters.radius !== initial.radius) count++;
      return count;
  }, [appliedVendorFilters]);

  const handleAddNewSpace = () => {
      alert("Navigate to 'Add New Space' page.");
  }
  
  const activeSpace = hostSpaces.find(s => s.id === activeSpaceId);
  
  const readinessProps: SpaceReadinessProps = useMemo(() => {
    if (!activeSpace) {
        return {
            availabilitySet: false,
            rateSet: false,
            hasMinPhotos: false,
            hasAmenities: false,
            hasDescription: false,
        };
    }
    return {
        availabilitySet: activeSpace.availabilitySet || false,
        rateSet: (activeSpace.rate || 0) > 0,
        hasMinPhotos: (activeSpace.propertyShowcaseUrls?.length || 0) >= 6,
        hasAmenities: (activeSpace.amenities?.length || 0) > 0,
        hasDescription: !!activeSpace.description && activeSpace.description.length > 20,
    };
  }, [activeSpace]);

  const spaceConnectionRequests = connectionRequests.filter(c => c.forSpace === activeSpace?.name);
  const spaceConfirmedBookings = confirmedBookings.filter(b => b.forSpace === activeSpace?.name);

  const getPartnerStatus = (partnerId: string): ConnectionStatus => {
    if (confirmedBookings.some(b => b.partnerId === partnerId)) return 'Booked';
    const request = connectionRequests.find(r => r.partnerId === partnerId);
    if (request) {
        if (request.status === 'New Request') return 'New Request';
        if (request.status === 'Awaiting Response') return 'Connection Requested';
        // Add other statuses if they are used in your data model e.g. 'Declined', 'Confirmed'
        return request.status as ConnectionStatus;
    }
    return 'Not Connected';
  };


  const displayedConnectionRequests = useMemo(() => {
    const roleToMatch = activeTab === 'guides' ? 'Guide' : 'Vendor';
    return spaceConnectionRequests.filter(req => req.role === roleToMatch);
  }, [spaceConnectionRequests, activeTab]);

  const displayedConfirmedBookings = useMemo(() => {
    const roleToMatch = activeTab === 'guides' ? 'Guide' : 'Vendor';
    return spaceConfirmedBookings.filter(booking => booking.partnerRole === roleToMatch);
  }, [spaceConnectionRequests, activeTab]);

  const handleGuideFilterChange = (newFilters: Partial<GuideFiltersState>) => {
    setGuideFilters(prev => ({...prev, ...newFilters}));
    setGuideFiltersDirty(true);
  };
  const handleApplyGuideFilters = () => {
    setAppliedGuideFilters(guideFilters);
    setGuideFiltersDirty(false);
  };
  const handleResetGuideFilters = () => {
    setGuideFilters(initialGuideFilters);
    setAppliedGuideFilters(initialGuideFilters);
    setGuideFiltersDirty(false);
  };
  
  const displayedGuides = useMemo(() => {
    let filtered = [...allGuides];
    
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
    
    switch (guideSortOption) {
      case 'rating':
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'newest':
         filtered.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
        break;
      case 'recommended':
      default:
         filtered.sort((a, b) => (b.premiumMembership ? 1 : 0) - (a.premiumMembership ? 1 : 0) || (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
        break;
    }
    
    return filtered;
  }, [appliedGuideFilters, guideSortOption]);

  const handleVendorFilterChange = (newFilters: Partial<VendorFiltersState>) => {
    setVendorFilters(prev => ({...prev, ...newFilters}));
    setVendorFiltersDirty(true);
  };
  const handleApplyVendorFilters = () => {
    setAppliedVendorFilters(vendorFilters);
    setVendorFiltersDirty(false);
  };
  const handleResetVendorFilters = () => {
    setVendorFilters(initialVendorFilters);
    setAppliedVendorFilters(initialVendorFilters);
    setVendorFiltersDirty(false);
  };

  const displayedVendors = useMemo(() => {
    const vendorsWithDistance = allVendors.map(vendor => {
      if (activeSpace?.hostLat && activeSpace.hostLng && vendor.vendorLat && vendor.vendorLng) {
        const distance = getDistanceInMiles(activeSpace.hostLat, activeSpace.hostLng, vendor.vendorLat, vendor.vendorLng);
        return { ...vendor, distance };
      }
      return { ...vendor, distance: Infinity };
    });

    let filtered = vendorsWithDistance.filter(vendor => {
      if (activeSpace?.hostLat && activeSpace.hostLng) {
        if (vendor.distance === Infinity) return false;
        
        const isInRadius = vendor.distance <= appliedVendorFilters.radius;
        const canService = !vendor.vendorServiceRadiusMiles || vendor.distance <= vendor.vendorServiceRadiusMiles;
        
        if (!isInRadius || !canService) return false;
      }

      if (appliedVendorFilters.categories.length > 0 && !appliedVendorFilters.categories.some(cat => vendor.category.includes(cat))) {
        return false;
      }
      if (appliedVendorFilters.budget < 5000 && (vendor.startingPrice ?? Infinity) > appliedVendorFilters.budget) {
        return false;
      }

      return true;
    });

    switch (vendorSortOption) {
      case 'price-asc':
        filtered.sort((a, b) => (a.startingPrice || Infinity) - (b.startingPrice || Infinity));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
        break;
      case 'recommended':
      default:
        filtered.sort((a, b) => {
          if (a.premiumMembership !== b.premiumMembership) return b.premiumMembership ? 1 : -1;
          if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0);
          if ((b.reviewCount ?? 0) !== (a.reviewCount ?? 0)) return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
          return (a.distance ?? Infinity) - (b.distance ?? Infinity);
        });
        break;
    }
    
    return filtered;

  }, [activeSpace, appliedVendorFilters, vendorSortOption]);
  
  const findConversationAndNavigate = async (targetUserId: string) => {
    if (currentUser.status !== 'authenticated' || !firestore) return null;
    
    const conversationsRef = collection(firestore, 'conversations');
    const q = query(conversationsRef, where('participants', 'array-contains', currentUser.data.uid), limit(25));
    const querySnapshot = await getDocs(q);
    
    let existingConversationId: string | null = null;
    querySnapshot.forEach(doc => {
        const data = doc.data();
        if(data.participants.includes(targetUserId)) {
            existingConversationId = doc.id;
        }
    });

    if (existingConversationId) {
        router.push(`/inbox?c=${existingConversationId}`);
        return existingConversationId;
    }
    return null;
  }

  const handleViewMessage = async (targetProfile: Guide | Vendor) => {
     const found = await findConversationAndNavigate(targetProfile.uid);
     if (!found) {
        toast({ title: 'No message thread found', description: "Start a connection first." });
     }
  };

  const handleRequestConnection = async (targetProfile: Guide | Vendor) => {
    if (currentUser.status !== 'authenticated' || !firestore) {
      router.push(`/login?redirect=/host/dashboard`);
      return;
    }
    
    if (currentUser.data.uid === targetProfile.uid) {
        toast({ title: "This is your own profile!", variant: "default" });
        return;
    }

    const existingStatus = getPartnerStatus(targetProfile.id);
    if (existingStatus !== 'Not Connected' && existingStatus !== 'Declined') {
        toast({ title: 'Already Connected', description: `You are already in contact with ${targetProfile.name}.` });
        if (existingStatus === 'In Conversation' || existingStatus === 'New Request') {
          findConversationAndNavigate(targetProfile.uid);
        }
        return;
    }

    setIsConnecting(true);

    try {
      const existingId = await findConversationAndNavigate(targetProfile.uid);
      if (existingId) return;

      const newConversationRef = await addDoc(collection(firestore, 'conversations'), {
        participants: [currentUser.data.uid, targetProfile.uid],
        participantInfo: {
          [currentUser.data.uid]: {
            displayName: currentUser.profile?.displayName || 'Me',
            avatarUrl: currentUser.profile?.avatarUrl || '',
          },
          [targetProfile.uid as string]: {
            displayName: targetProfile.name,
            avatarUrl: targetProfile.avatar?.imageUrl || '',
          }
        },
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessageSnippet: `Connection requested regarding ${activeSpace?.name || 'your space'}.`,
      });
      
      await addDoc(collection(newConversationRef, 'messages'), {
          senderId: currentUser.data.uid,
          text: `Hi ${targetProfile.name}, I found your profile on HighVibe Retreats and I’d like to connect about my space, "${activeSpace?.name}".`,
          createdAt: serverTimestamp(),
      });
      
      const newRequest = {
        id: newConversationRef.id,
        partnerId: targetProfile.id,
        name: targetProfile.name,
        role: 'specialty' in targetProfile ? 'Guide' : 'Vendor',
        forSpace: activeSpace?.name || '',
        status: 'In Conversation' as const,
      };

      setConnectionRequests(prev => [...prev.filter(r => r.partnerId !== targetProfile.id), newRequest]);
      
      toast({
        title: 'Connection Started!',
        description: `You can now message ${targetProfile.name}.`,
      });

    } catch (error) {
      console.error("Error requesting connection:", error);
      toast({ title: "Could not start connection", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="md:mr-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-beige">Host Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg font-body">Offer a space designed for retreat experiences.</p>
        </div>

        <div className="relative h-[104px] w-[420px] hidden lg:block mx-auto flex-shrink-0 rounded-xl shadow-md overflow-hidden">
            <Image
                src="/Host%20Cabin.png?v=1"
                alt="A cozy cabin in a forest setting"
                data-ai-hint="cabin forest"
                fill
                className="object-cover"
                style={{ objectPosition: 'center center' }}
            />
        </div>
        
        <div className="flex-grow"></div>

        <div className="flex items-center gap-4 mt-4 md:mt-0 flex-shrink-0">
            <Button size="lg" onClick={handleAddNewSpace}>
              <PlusCircle className="mr-2 h-5 w-5" />
              List Your Space
            </Button>
        </div>
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
            <CardHeader className="!pb-2">
                <CardTitle className="font-headline text-3xl">Partnership Dashboard for {activeSpace ? `"${activeSpace.name}"` : 'Your Space'}</CardTitle>
                <CardDescription className="font-body text-base">Find the right guides and local vendors to partner with.</CardDescription>
                <div className="!mt-4 max-w-sm">
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
            <CardContent className="space-y-6">
                {activeSpaceId ? (
                    <>
                        <div className="space-y-6">
                           <SpaceReadinessChecklist {...readinessProps} />
                        </div>
                        <Separator />
                        <div className="pt-4">
                             <h3 className="font-headline text-2xl mb-2">Matches Available</h3>
                             <p className="text-muted-foreground mb-4">Potential connections that fit this space.</p>
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'guides' | 'vendors')}>
                                <TabsList className="grid w-full grid-cols-2 bg-primary text-primary-foreground h-auto">
                                    <TabsTrigger value="guides" className="text-base py-2.5">Guides (Retreat Leaders)</TabsTrigger>
                                    <TabsTrigger value="vendors" className="text-base py-2.5">Vendors (Local Partners)</TabsTrigger>
                                </TabsList>
                                <TabsContent value="guides" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                        {guideFiltersVisible && (
                                            <div className="lg:col-span-1">
                                                <GuideFilters filters={guideFilters} onFiltersChange={handleGuideFilterChange} onApply={handleApplyGuideFilters} onReset={handleResetGuideFilters} isDirty={guideFiltersDirty}/>
                                            </div>
                                        )}
                                        <div className={cn(guideFiltersVisible ? 'lg:col-span-3' : 'lg:col-span-4')}>
                                            <div className='space-y-4'>
                                                <div className="flex justify-between items-center mb-4 gap-4">
                                                    <div className='flex items-center gap-4'>
                                                        <Button onClick={() => setGuideFiltersVisible(!guideFiltersVisible)} variant="outline">
                                                            <Filter className="mr-2 h-4 w-4" />
                                                            {guideFiltersVisible ? 'Hide' : 'Show'} Filters
                                                            {!guideFiltersVisible && appliedGuideFiltersCount > 0 && (
                                                                <Badge variant="secondary" className="ml-2">{appliedGuideFiltersCount}</Badge>
                                                            )}
                                                        </Button>
                                                        <h4 className="font-headline text-xl hidden sm:block">{displayedGuides.length} Matching Guides</h4>
                                                    </div>
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
                                                <h4 className="font-headline text-xl sm:hidden mb-4">{displayedGuides.length} Matching Guides</h4>
                                                {displayedGuides.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {displayedGuides.map(guide => 
                                                          <GuideCard 
                                                            key={guide.id} 
                                                            guide={guide} 
                                                            onConnect={handleRequestConnection} 
                                                            onViewMessage={handleViewMessage}
                                                            connectionStatus={getPartnerStatus(guide.id)}
                                                          />)}
                                                    </div>
                                                ) : (
                                                    <Card className="text-center py-12">
                                                        <CardHeader>
                                                            <CardTitle className="font-headline text-xl">No matches yet.</CardTitle>
                                                            <CardDescription>Try resetting filters.</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <Button onClick={handleResetGuideFilters}>Reset Filters</Button>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="vendors" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                        {vendorFiltersVisible && (
                                            <div className="lg:col-span-1">
                                                <VendorFilters 
                                                    filters={vendorFilters} 
                                                    onFiltersChange={handleVendorFilterChange}
                                                    onApply={handleApplyVendorFilters}
                                                    onReset={handleResetVendorFilters}
                                                    isDirty={vendorFiltersDirty}
                                                />
                                            </div>
                                        )}
                                        <div className={cn(vendorFiltersVisible ? 'lg:col-span-3' : 'lg:col-span-4')}>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center mb-4 gap-4">
                                                    <div className='flex items-center gap-4'>
                                                         <Button onClick={() => setVendorFiltersVisible(!vendorFiltersVisible)} variant="outline">
                                                            <Filter className="mr-2 h-4 w-4" />
                                                            {vendorFiltersVisible ? 'Hide' : 'Show'} Filters
                                                            {!vendorFiltersVisible && appliedVendorFiltersCount > 0 && (
                                                                <Badge variant="secondary" className="ml-2">{appliedVendorFiltersCount}</Badge>
                                                            )}
                                                        </Button>
                                                        <h4 className="font-headline text-xl hidden sm:block">{displayedVendors.length} Matching Vendors</h4>
                                                    </div>
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
                                                 <h4 className="font-headline text-xl sm:hidden mb-4">{displayedVendors.length} Matching Vendors</h4>

                                                {displayedVendors.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {displayedVendors.map(vendor => 
                                                      <VendorCard 
                                                        key={vendor.id} 
                                                        vendor={vendor} 
                                                        distance={vendor.distance} 
                                                        onConnect={handleRequestConnection}
                                                        onViewMessage={handleViewMessage}
                                                        connectionStatus={getPartnerStatus(vendor.id) as any}
                                                      />)}
                                                    </div>
                                                ) : (
                                                    <Card className="text-center py-12">
                                                        <CardHeader>
                                                            <CardTitle className="font-headline text-xl">No matches yet.</CardTitle>
                                                            <CardDescription>Try resetting filters.</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <Button onClick={handleResetVendorFilters}>Reset Filters</Button>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        
                        <Separator className="my-6" />

                        <div>
                            <h3 className="font-headline text-2xl mb-2">Connections Requested</h3>
                            <p className="text-muted-foreground mb-4">People you’ve reached out to or who’ve started a conversation with you.</p>
                             {displayedConnectionRequests.length > 0 ? (
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
                                        {displayedConnectionRequests.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-medium">{req.name}</TableCell>
                                                <TableCell>{req.role}</TableCell>
                                                <TableCell><Badge variant={req.status === 'New Request' ? 'default' : 'secondary'}>{req.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewMessage(allGuides.find(g=>g.id === req.partnerId) || allVendors.find(v=>v.id===req.partnerId)! )}>View Message</Button>
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
                        
                        <Separator className="my-6" />

                        <div>
                            <h3 className="font-headline text-2xl mb-2">Confirmed Bookings</h3>
                            <p className="text-muted-foreground mb-4">These are your confirmed retreat collaborations.</p>
                            {displayedConfirmedBookings.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{activeTab === 'guides' ? 'Guide' : 'Partner'}</TableHead>
                                            <TableHead>Retreat</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedConfirmedBookings.map(booking => (
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
                                    <p className="text-muted-foreground">Your confirmed retreat collaborations will appear here.</p>
                                     <Button variant="link" className="mt-2" onClick={() => document.getElementById('partnership-dashboard')?.scrollIntoView({ behavior: 'smooth' })}>
                                        Continue building connections
                                    </Button>
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

    