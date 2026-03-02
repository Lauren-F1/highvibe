

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, CheckCircle, XCircle, Filter, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { yourRetreats as mockRetreats, hosts as mockHosts, vendors as mockVendors, UserSubscriptionStatus, destinations, connectionRequests, confirmedBookings, type Host, type Vendor } from '@/lib/mock-data';
import { loadHosts, loadVendors } from '@/lib/firestore-partners';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { HostCard, type ConnectionStatus } from '@/components/host-card';
import { VendorCard } from '@/components/vendor-card';
import { HostFilters, type HostFiltersState } from '@/components/host-filters';
import { VendorFilters, type VendorFiltersState as VendorFiltersStateType } from '@/components/vendor-filters';
import { PartnershipStepper, type PartnershipStage } from '@/components/partnership-stepper';
import { NextBestAction } from '@/components/next-best-action';
import { cn } from '@/lib/utils';
import { RetreatReadinessChecklist, type RetreatReadinessProps } from '@/components/retreat-readiness-checklist';
import { WaitlistModal } from '@/components/waitlist-modal';
import { VibeMatchModal } from '@/components/vibe-match-modal';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ScoutVendors } from '@/components/scout-vendors';

interface FirestoreRetreat {
  id: string;
  hostId: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  costPerPerson: number;
  currency: string;
  capacity: number;
  currentAttendees: number;
  locationDescription: string;
  status: string;
  included?: string;
}

// Adapt Firestore retreats to the shape the dashboard expects
function toDisplayRetreat(r: FirestoreRetreat) {
  return {
    id: r.id,
    name: r.title,
    status: r.status === 'published' ? 'Published' : r.status === 'paused' ? 'Paused' : 'Draft',
    bookings: r.currentAttendees || 0,
    income: (r.currentAttendees || 0) * r.costPerPerson,
    location: r.locationDescription,
    image: undefined as string | undefined,
    datesSet: !!r.startDate && !!r.endDate,
    capacity: r.capacity,
    firestoreId: r.id,
  };
}


const genericImage = '/generic-placeholder.jpg';

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

const initialVendorFilters: VendorFiltersStateType = {
  categories: [],
  locationPreference: 'local',
  budget: 5000,
  planningWindow: 'anytime',
  availabilityTypes: [],
  showNearMatches: false,
  showExactDates: false,
  radius: 50,
};


export default function GuidePage() {
  const router = useRouter();
  const user = useUser();
  const firestore = useFirestore();
  const [firestoreRetreats, setFirestoreRetreats] = useState<ReturnType<typeof toDisplayRetreat>[]>([]);
  const [retreatsLoaded, setRetreatsLoaded] = useState(false);

  // Load retreats from Firestore
  useEffect(() => {
    if (!firestore || user.status !== 'authenticated' || !user.data?.uid) return;

    const loadRetreats = async () => {
      try {
        const q = query(collection(firestore, 'retreats'), where('hostId', '==', user.data!.uid));
        const snap = await getDocs(q);
        const retreats = snap.docs.map(d => toDisplayRetreat(d.data() as FirestoreRetreat));
        setFirestoreRetreats(retreats);
      } catch (error) {
        console.warn('Failed to load retreats from Firestore, using mock data:', error);
      } finally {
        setRetreatsLoaded(true);
      }
    };

    loadRetreats();
  }, [firestore, user.status, user.data?.uid]);

  // Use Firestore retreats if available, fall back to mock
  const yourRetreats = retreatsLoaded && firestoreRetreats.length > 0 ? firestoreRetreats : mockRetreats;

  // Load real hosts and vendors from Firestore
  const [firestoreHosts, setFirestoreHosts] = useState<Host[]>([]);
  const [firestoreVendors, setFirestoreVendors] = useState<Vendor[]>([]);
  const [partnersLoaded, setPartnersLoaded] = useState(false);

  useEffect(() => {
    if (!firestore || user.status !== 'authenticated' || !user.data?.uid) return;

    const loadPartners = async () => {
      try {
        const [hostsResult, vendorsResult] = await Promise.all([
          loadHosts(firestore, user.data!.uid),
          loadVendors(firestore, user.data!.uid),
        ]);
        setFirestoreHosts(hostsResult);
        setFirestoreVendors(vendorsResult);
      } catch (error) {
        console.error('Error loading partners:', error);
      } finally {
        setPartnersLoaded(true);
      }
    };

    loadPartners();
  }, [firestore, user.status, user.data?.uid]);

  const hosts = partnersLoaded && firestoreHosts.length > 0 ? firestoreHosts : mockHosts;
  const vendors = partnersLoaded && firestoreVendors.length > 0 ? firestoreVendors : mockVendors;

  const [activeRetreatId, setActiveRetreatId] = useState<string | null>(null);
  const [subscriptionStatus] = useState<UserSubscriptionStatus>('active'); // mock status
  const { toast } = useToast();

  // Set initial active retreat once data is ready
  useEffect(() => {
    if (yourRetreats.length > 0 && !activeRetreatId) {
      setActiveRetreatId(yourRetreats[0].id);
    }
  }, [yourRetreats, activeRetreatId]);
  
  const [hostFilters, setHostFilters] = useState<HostFiltersState>(initialHostFilters);
  const [sortOption, setSortOption] = useState('recommended');
  const [hostFiltersVisible, setHostFiltersVisible] = useState(false);

  const [vendorFilters, setVendorFilters] = useState<VendorFiltersStateType>(initialVendorFilters);
  const [vendorSortOption, setVendorSortOption] = useState('recommended');
  const [vendorFiltersVisible, setVendorFiltersVisible] = useState(false);
  const [appliedVendorFilters, setAppliedVendorFilters] = useState<VendorFiltersStateType>(initialVendorFilters);
  const [vendorFiltersDirty, setVendorFiltersDirty] = useState(false);

  const [currentConnectionRequests, setCurrentConnectionRequests] = useState(connectionRequests);
  const [showFeatureGate, setShowFeatureGate] = useState(false);
  const guideHeroImage = '/guide-dashboard-hero.jpg';
  
  const [vibeImages, setVibeImages] = useState<string[]>([]);
  const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);

  const isAgreementAccepted = user.status === 'authenticated' && user.profile?.providerAgreementAccepted === true;

  const appliedHostFiltersCount = useMemo(() => {
    let count = 0;
    const initial = initialHostFilters;
    if (hostFilters.continent !== initial.continent) count++;
    if (hostFilters.region && hostFilters.region !== initial.region) count++;
    if (hostFilters.planningWindow !== initial.planningWindow) count++;
    if (hostFilters.flexibleDates) count++;
    if (hostFilters.showNearMatches) count++;
    if (hostFilters.showExactDates) count++;
    if (hostFilters.budget < initial.budget) count++;
    if (hostFilters.sleepingCapacity !== initial.sleepingCapacity) count++;
    if (hostFilters.eventCapacity !== initial.eventCapacity) count++;
    if (hostFilters.bedrooms !== initial.bedrooms) count++;
    if (hostFilters.bathrooms !== initial.bathrooms) count++;
    count += hostFilters.roomStyles.length;
    count += hostFilters.amenities.length;
    if (hostFilters.retreatReady) count++;
    if (hostFilters.gatheringSpace) count++;
    if (hostFilters.quietSetting) count++;
    if (hostFilters.kitchen !== initial.kitchen) count++;
    count += hostFilters.policies.length;
    count += hostFilters.vibes.length;
    return count;
  }, [hostFilters]);

  const handleVendorFilterChange = (newFilters: Partial<VendorFiltersStateType>) => {
    setVendorFilters(prev => ({ ...prev, ...newFilters }));
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
  
  const appliedVendorFiltersCount = useMemo(() => {
    let count = 0;
    const initial = initialVendorFilters;
    if (vendorFilters.categories.length > 0) count++;
    if (vendorFilters.locationPreference !== initial.locationPreference) count++;
    if (vendorFilters.budget < initial.budget) count++;
    if (vendorFilters.planningWindow !== initial.planningWindow) count++;
    if (vendorFilters.availabilityTypes.length > 0) count++;
    if (vendorFilters.showNearMatches) count++;
    if (vendorFilters.showExactDates) count++;
    if (vendorFilters.radius !== initial.radius) count++;
    return count;
  }, [vendorFilters]);


  const handleCreateRetreatClick = () => {
    if (!isAgreementAccepted) {
        toast({
            title: "Provider Agreement Required",
            description: "Please accept the Provider Agreement in your profile to create a retreat.",
            variant: "destructive",
        });
        return;
    }
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
  const retreatConnectionRequests = activeRetreat ? currentConnectionRequests.filter(c => c.forRetreat === activeRetreat.name) : [];
  const retreatConfirmedBookings = activeRetreat ? confirmedBookings.filter(c => c.forRetreat === activeRetreat.name) : [];

  const getPartnerStatus = (partnerId: string): ConnectionStatus => {
    if (!activeRetreat) return 'Not Invited';
    if (retreatConfirmedBookings.some(b => b.partnerId === partnerId)) return 'Booked';
    
    const request = retreatConnectionRequests.find(r => r.partnerId === partnerId);
    if (request) {
        if(request.status === "Declined") return 'Declined';
        if(request.status === "Confirmed") return 'Confirmed';
        if(request.status === "Conversation Started") return 'In Conversation';
        if(request.status === "Invite Sent") return 'Invite Sent';
    }
    return 'Not Invited';
  };

  const handleInvitePartner = (partner: Host | Vendor) => {
    if (!activeRetreat) {
        toast({
            title: 'Select a Retreat',
            description: 'Please select a retreat before inviting partners.',
            variant: 'destructive',
        });
        return;
    }
    if (!isAgreementAccepted) {
        toast({
            title: "Provider Agreement Required",
            description: "Please accept the Provider Agreement in your profile to invite partners.",
            variant: "destructive",
        });
        return;
    }

    const existingStatus = getPartnerStatus(partner.id);
    if (existingStatus !== 'Not Invited' && existingStatus !== 'Declined') {
        toast({
            title: 'Already Connected',
            description: `You're already in contact with ${partner.name}.`,
        });
        return;
    }

    const existingRequest = currentConnectionRequests.find(r => r.partnerId === partner.id && r.forRetreat === activeRetreat.name);
    if(existingRequest) {
        setCurrentConnectionRequests(prev => prev.map(r => r.id === existingRequest.id ? {...r, status: 'Invite Sent'} : r));
    } else {
        const newRequest = {
            id: `cr-${Date.now()}`,
            partnerId: partner.id,
            name: partner.name,
            // @ts-ignore
            role: 'capacity' in partner ? 'Host' : 'Vendor',
            forRetreat: activeRetreat.name,
            status: 'Invite Sent' as const,
        };
        // @ts-ignore
        setCurrentConnectionRequests(prev => [...prev, newRequest]);
    }
    
    toast({
        title: 'Invite Sent!',
        description: `${partner.name} has been invited to collaborate on "${activeRetreat.name}".`,
    });
  };

  const handleViewPartnerMessage = (partner: Host | Vendor) => {
    const req = currentConnectionRequests.find(c => c.partnerId === partner.id && c.forRetreat === activeRetreat?.name);
    if (req?.id) {
        handleViewMessage(req.id);
    } else {
        toast({
            title: 'No Message Thread',
            description: "Start a conversation by inviting them first.",
        });
    }
  };
  
  const getPartnershipStage = (retreat: (typeof yourRetreats)[0] | undefined, requests: typeof retreatConnectionRequests, bookings: typeof retreatConfirmedBookings): PartnershipStage => {
      if (!retreat) return 'Shortlist';
      if (retreat.status === 'Draft') return 'Draft';
      if (bookings.length > 0) return 'Booked';
      if (requests.some(r => r.status === 'Confirmed')) return 'Confirmed';
      if (requests.some(r => r.status === 'Conversation Started')) return 'In Conversation';
      if (requests.length > 0) return 'Invites Sent';
      return 'Shortlist';
  };

  const partnershipStage = getPartnershipStage(activeRetreat, retreatConnectionRequests, retreatConfirmedBookings);

  const readinessProps: RetreatReadinessProps = useMemo(() => ({
    datesSet: activeRetreat?.datesSet || false,
    capacitySet: (activeRetreat?.capacity || 0) > 0,
    hostsShortlisted: hosts.filter(h => getPartnerStatus(h.id) !== 'Not Invited').length >= 3,
    vendorsInvited: vendors.filter(v => ['Invite Sent', 'In Conversation', 'Confirmed', 'Booked'].includes(getPartnerStatus(v.id))).length >= 2,
    activeConversations: retreatConnectionRequests.some(c => c.status === 'Conversation Started'),
  }), [activeRetreat, retreatConnectionRequests, retreatConfirmedBookings]);


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
            const regionsInContinent = destinations[hostFilters.continent as keyof typeof destinations] || [];
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
         filtered.sort((a, b) => (b.premiumMembership ? 1 : 0) - (a.premiumMembership ? 1 : 0) || (b.luxApproved ? 1 : 0) - (a.luxApproved ? 1 : 0) || a.pricePerNight - b.pricePerNight);
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

  const displayVendors = useMemo(() => {
    let filtered = [...vendors];

    if (appliedVendorFilters.categories.length > 0) {
      filtered = filtered.filter(vendor => appliedVendorFilters.categories.includes(vendor.category));
    }
    
    if (appliedVendorFilters.budget < 5000) {
      filtered = filtered.filter(vendor => (vendor.startingPrice || Infinity) <= appliedVendorFilters.budget);
    }

    switch (vendorSortOption) {
      case 'price-asc':
        filtered.sort((a, b) => (a.startingPrice || Infinity) - (b.startingPrice || Infinity));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'recommended':
      default:
        filtered.sort((a, b) => {
          if (a.premiumMembership !== b.premiumMembership) return b.premiumMembership ? 1 : -1;
          if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0);
          return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        });
        break;
    }

    return filtered;
  }, [appliedVendorFilters, vendorSortOption]);

  const noHostsFound = displayHosts.length === 0;
  const noVendorsFound = displayVendors.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <VibeMatchModal
        isOpen={isVibeModalOpen}
        onOpenChange={setIsVibeModalOpen}
        vibeImages={vibeImages}
        onVibeImagesChange={setVibeImages}
        activeRetreatId={activeRetreatId}
      />
      <WaitlistModal isOpen={showFeatureGate} onOpenChange={setShowFeatureGate} source="feature-gate-guide-edit" />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="md:mr-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-beige">Guide Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg font-body">Design and lead meaningful retreat experiences.</p>
        </div>

        <div className="relative h-[104px] w-[420px] hidden lg:block mx-auto flex-shrink-0 rounded-xl shadow-md overflow-hidden">
            <Image
                src={guideHeroImage}
                alt={'Guide leading yoga at sunset'}
                fill
                className="object-cover"
                style={{ objectPosition: 'center 60%' }}
            />
        </div>

        <div className="flex-grow"></div>

        <div className="flex items-center gap-4 mt-4 md:mt-0 flex-shrink-0">
            <Badge variant={subscriptionBadge.variant} className="h-9">
                {subscriptionBadge.icon}
                {subscriptionBadge.label}
            </Badge>
            <Button size="lg" variant="outline" asChild>
              <Link href="/guide/itinerary-planner"><Sparkles className="mr-2 h-5 w-5" /> AI Itinerary Planner</Link>
            </Button>
            <Button size="lg" onClick={handleCreateRetreatClick} disabled={!isAgreementAccepted} title={!isAgreementAccepted ? "Please accept the Provider Agreement to create a retreat" : ""}>
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
                        src={retreat.image || genericImage}
                        alt={retreat.name}
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
                          <DropdownMenuItem onClick={() => {
                            if ((retreat as any).firestoreId) {
                              router.push(`/guide/retreats/${retreat.id}/edit`);
                            } else {
                              setShowFeatureGate(true);
                            }
                          }}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Duplicate clicked')}>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            if ((retreat as any).firestoreId && firestore) {
                              try {
                                const ref = doc(firestore, 'retreats', retreat.id);
                                const newStatus = retreat.status === 'Published' ? 'paused' : 'published';
                                await updateDoc(ref, { status: newStatus, updatedAt: serverTimestamp() });
                                setFirestoreRetreats(prev => prev.map(r => r.id === retreat.id ? { ...r, status: newStatus === 'published' ? 'Published' : 'Paused' } : r));
                                toast({ title: `Retreat ${newStatus}` });
                              } catch (e) {
                                toast({ title: 'Failed to update status', variant: 'destructive' });
                              }
                            } else {
                              alert('Unpublish clicked');
                            }
                          }}>{retreat.status === 'Published' ? 'Unpublish' : 'Publish'}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={async () => {
                            if ((retreat as any).firestoreId && firestore) {
                              if (!confirm(`Delete "${retreat.name}"? This cannot be undone.`)) return;
                              try {
                                await deleteDoc(doc(firestore, 'retreats', retreat.id));
                                setFirestoreRetreats(prev => prev.filter(r => r.id !== retreat.id));
                                toast({ title: 'Retreat deleted' });
                              } catch (e) {
                                toast({ title: 'Failed to delete', variant: 'destructive' });
                              }
                            } else {
                              alert('Delete clicked');
                            }
                          }}>Delete</DropdownMenuItem>
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
                            <RetreatReadinessChecklist {...readinessProps} />
                        </div>
                        
                        <div className="my-6">
                            <Card className="border-beige-dark bg-beige-dark/20">
                                <CardHeader className="flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                            <Sparkles className="text-beige" />
                                            Match My Vibe
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Upload inspiration from Pinterest or anywhere you gather ideas. We’ll connect you with hosts and vendors who align with your vibe.
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => setIsVibeModalOpen(true)}>
                                        Add Your Vibe
                                    </Button>
                                </CardHeader>
                            </Card>
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
                                        {hostFiltersVisible && (
                                            <div className="lg:col-span-1">
                                                <HostFilters filters={hostFilters} onFiltersChange={(newFilters) => setHostFilters(prev => ({...prev, ...newFilters}))} />
                                            </div>
                                        )}
                                        <div className={cn(hostFiltersVisible ? 'lg:col-span-3' : 'lg:col-span-4')}>
                                            <div className="flex justify-between items-center mb-4 gap-4">
                                                <div className='flex items-center gap-4'>
                                                    <Button onClick={() => setHostFiltersVisible(!hostFiltersVisible)} variant="outline">
                                                        <Filter className="mr-2 h-4 w-4" />
                                                        {hostFiltersVisible ? 'Hide' : 'Show'} Filters
                                                        {!hostFiltersVisible && appliedHostFiltersCount > 0 && (
                                                            <Badge variant="secondary" className="ml-2">{appliedHostFiltersCount}</Badge>
                                                        )}
                                                    </Button>
                                                     <h3 className="font-headline text-2xl hidden sm:block">{displayHosts.length} potential {displayHosts.length === 1 ? 'space' : 'spaces'} found</h3>
                                                </div>
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
                                            <h3 className="font-headline text-2xl sm:hidden mb-4">{displayHosts.length} potential {displayHosts.length === 1 ? 'space' : 'spaces'} found</h3>

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
                                                    {displayHosts.map(host => 
                                                        <HostCard 
                                                            key={host.id} 
                                                            host={host} 
                                                            onConnect={handleInvitePartner} 
                                                            connectionStatus={getPartnerStatus(host.id)}
                                                            onViewMessage={handleViewPartnerMessage}
                                                        />
                                                    )}
                                                </div>
                                            )}
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
                                        <div className={cn(vendorFiltersVisible ? "lg:col-span-3" : "lg:col-span-4")}>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className='flex items-center gap-4'>
                                                    <Button onClick={() => setVendorFiltersVisible(!vendorFiltersVisible)} variant="outline">
                                                        <Filter className="mr-2 h-4 w-4" />
                                                        {vendorFiltersVisible ? 'Hide' : 'Show'} Filters
                                                        {!vendorFiltersVisible && appliedVendorFiltersCount > 0 && (
                                                            <Badge variant="secondary" className="ml-2">{appliedVendorFiltersCount}</Badge>
                                                        )}
                                                    </Button>
                                                    <h3 className="font-headline text-2xl hidden sm:block">{displayVendors.length} potential {displayVendors.length === 1 ? 'vendor' : 'vendors'} found</h3>
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
                                            <h3 className="font-headline text-2xl sm:hidden mb-4">{displayVendors.length} potential {displayVendors.length === 1 ? 'vendor' : 'vendors'} found</h3>
                                            
                                            {noVendorsFound ? (
                                                 <div className="text-center py-12 rounded-lg bg-secondary/50">
                                                    <p className="text-muted-foreground max-w-md mx-auto">We’re expanding this network. If you don’t see the perfect match yet, we’ll surface new vendors as they join.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {displayVendors.map(vendor => 
                                                        <VendorCard 
                                                            key={vendor.id} 
                                                            vendor={vendor} 
                                                            onConnect={handleInvitePartner} 
                                                            connectionStatus={getPartnerStatus(vendor.id)}
                                                            onViewMessage={handleViewPartnerMessage}
                                                        />
                                                    )}
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
                                                <TableCell><Badge variant={
                                                    req.status === 'Conversation Started' ? 'default' : 
                                                    req.status === 'Confirmed' ? 'default' :
                                                    req.status === 'Declined' ? 'destructive' : 'secondary'
                                                }>{req.status}</Badge></TableCell>
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

        {/* Scout Local Vendors */}
        {user.status === 'authenticated' && user.data?.uid && (
          <ScoutVendors
            retreatLocation={activeRetreat?.location}
            retreatDescription={activeRetreat?.name}
            guideUserId={user.data.uid}
            retreatId={activeRetreatId || undefined}
          />
        )}
      </div>
    </div>
  );
}

    