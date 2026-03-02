

"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, Eye, Users, MessageSquare, CheckCircle, DollarSign, MoreHorizontal, Filter } from 'lucide-react';
import { yourServices as mockServices, matchingGuidesForVendor as mockGuides, matchingHostsForVendor as mockHosts, type Guide, type Host } from '@/lib/mock-data';
import { loadGuides, loadHosts } from '@/lib/firestore-partners';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { GuideCard } from '@/components/guide-card';
import { HostCard } from '@/components/host-card';
import { VendorGuideFilters, type VendorGuideFiltersState } from '@/components/vendor-guide-filters';
import { VendorHostFilters, type VendorHostFiltersState } from '@/components/vendor-host-filters';
import { useToast } from '@/hooks/use-toast';
import { type ConnectionStatus } from '@/components/guide-card';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

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

const initialConnectionRequests = [
    { id: 'cr1', partnerId: 'g3', name: 'Isabella Rossi', role: 'Guide' as const, regarding: 'Holistic Catering', status: 'Awaiting Response' as const },
    { id: 'cr2', partnerId: 'h1', name: 'The Glass House', role: 'Host' as const, regarding: 'Holistic Catering', status: 'New Request' as const }
];
const initialConfirmedBookings = [
    { id: 'cb1', partnerId: 'g1', clientName: 'Asha Sharma', clientRole: 'Guide' as const, service: 'Holistic Catering', dates: 'Dec 1-5, 2024' }
];


const initialGuideFilters: VendorGuideFiltersState = {
  location: 'any',
  retreatTypes: [],
  dateRange: 'anytime',
  groupSize: 100,
  budgetTiers: [],
  services: [],
};

const initialHostFilters: VendorHostFiltersState = {
  location: 'any',
  propertyTypes: [],
  capacity: 100,
  retreatFrequency: 'any',
};


interface DisplayService {
  id: string;
  name: string;
  category: string;
  serviceArea: string;
  startingPrice: number;
  status: string;
  isFirestore?: boolean;
}

function firestoreServiceToDisplay(data: Record<string, unknown>): DisplayService {
  return {
    id: data.id as string,
    name: data.name as string || '',
    category: data.category as string || '',
    serviceArea: data.serviceArea as string || '',
    startingPrice: data.startingPrice as number || 0,
    status: ((data.status as string) || 'draft').charAt(0).toUpperCase() + ((data.status as string) || 'draft').slice(1),
    isFirestore: true,
  };
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();

  // Load services from Firestore
  const [firestoreServices, setFirestoreServices] = useState<DisplayService[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);

  useEffect(() => {
    if (!firestore || user.status !== 'authenticated') return;

    const loadServices = async () => {
      try {
        const servicesRef = collection(firestore, 'services');
        const q = query(servicesRef, where('vendorId', '==', user.data.uid));
        const snapshot = await getDocs(q);
        const services = snapshot.docs.map(d => firestoreServiceToDisplay({ id: d.id, ...d.data() }));
        setFirestoreServices(services);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setServicesLoaded(true);
      }
    };

    loadServices();
  }, [firestore, user.status]);

  const yourServices = servicesLoaded && firestoreServices.length > 0 ? firestoreServices : mockServices.map(s => ({ ...s, isFirestore: false }));

  // Load real guides and hosts from Firestore
  const [firestoreGuides, setFirestoreGuides] = useState<Guide[]>([]);
  const [firestoreHosts, setFirestoreHosts] = useState<Host[]>([]);
  const [partnersLoaded, setPartnersLoaded] = useState(false);

  useEffect(() => {
    if (!firestore || user.status !== 'authenticated') return;

    const loadPartners = async () => {
      try {
        const [guidesResult, hostsResult] = await Promise.all([
          loadGuides(firestore, user.data.uid),
          loadHosts(firestore, user.data.uid),
        ]);
        setFirestoreGuides(guidesResult);
        setFirestoreHosts(hostsResult);
      } catch (error) {
        console.error('Error loading partners:', error);
      } finally {
        setPartnersLoaded(true);
      }
    };

    loadPartners();
  }, [firestore, user.status]);

  const allGuides = partnersLoaded && firestoreGuides.length > 0 ? firestoreGuides : mockGuides;
  const allHosts = partnersLoaded && firestoreHosts.length > 0 ? firestoreHosts : mockHosts;

  const [connectionRequests, setConnectionRequests] = useState(initialConnectionRequests);
  const [confirmedBookings, setConfirmedBookings] = useState(initialConfirmedBookings);

  const [guideFilters, setGuideFilters] = useState<VendorGuideFiltersState>(initialGuideFilters);
  const [appliedGuideFilters, setAppliedGuideFilters] = useState<VendorGuideFiltersState>(initialGuideFilters);
  const [guideFiltersDirty, setGuideFiltersDirty] = useState(false);
  const [guideFiltersVisible, setGuideFiltersVisible] = useState(false);
  const [guideSortOption, setGuideSortOption] = useState('recommended');

  const [hostFilters, setHostFilters] = useState<VendorHostFiltersState>(initialHostFilters);
  const [appliedHostFilters, setAppliedHostFilters] = useState<VendorHostFiltersState>(initialHostFilters);
  const [hostFiltersDirty, setHostFiltersDirty] = useState(false);
  const [hostFiltersVisible, setHostFiltersVisible] = useState(false);
  const [hostSortOption, setHostSortOption] = useState('recommended');
  const vendorHeroImage = '/vendor-dashboard-hero.jpg';

  const isAgreementAccepted = user.status === 'authenticated' && user.profile?.providerAgreementAccepted === true;

  const appliedGuideFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedGuideFilters.location !== initialGuideFilters.location) count++;
    if (appliedGuideFilters.retreatTypes.length > 0) count++;
    if (appliedGuideFilters.dateRange !== initialGuideFilters.dateRange) count++;
    if (appliedGuideFilters.groupSize < initialGuideFilters.groupSize) count++;
    if (appliedGuideFilters.budgetTiers.length > 0) count++;
    if (appliedGuideFilters.services.length > 0) count++;
    return count;
  }, [appliedGuideFilters]);

  const appliedHostFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedHostFilters.location !== initialHostFilters.location) count++;
    if (appliedHostFilters.propertyTypes.length > 0) count++;
    if (appliedHostFilters.capacity < initialHostFilters.capacity) count++;
    if (appliedHostFilters.retreatFrequency !== initialHostFilters.retreatFrequency) count++;
    return count;
  }, [appliedHostFilters]);

  const handleGuideFilterChange = (newFilters: Partial<VendorGuideFiltersState>) => {
    setGuideFilters(prev => ({ ...prev, ...newFilters }));
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
  
  const handleHostFilterChange = (newFilters: Partial<VendorHostFiltersState>) => {
    setHostFilters(prev => ({ ...prev, ...newFilters }));
    setHostFiltersDirty(true);
  };
  const handleApplyHostFilters = () => {
    setAppliedHostFilters(hostFilters);
    setHostFiltersDirty(false);
  };
  const handleResetHostFilters = () => {
    setHostFilters(initialHostFilters);
    setAppliedHostFilters(initialHostFilters);
    setHostFiltersDirty(false);
  };

  const displayedGuides = useMemo(() => {
    let filtered = [...allGuides];
    // TODO: Add filtering logic based on appliedGuideFilters
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

  const displayedHosts = useMemo(() => {
    let filtered = [...allHosts];
    // TODO: Add filtering logic based on appliedHostFilters
    switch (hostSortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'recommended':
      default:
         filtered.sort((a, b) => (b.premiumMembership ? 1 : 0) - (a.premiumMembership ? 1 : 0) || (b.luxApproved ? 1 : 0) - (a.luxApproved ? 1 : 0) || b.pricePerNight - a.pricePerNight);
        break;
    }
    return filtered;
  }, [appliedHostFilters, hostSortOption]);


  const handleAddNewService = () => {
    if (!isAgreementAccepted) {
        toast({
            title: "Provider Agreement Required",
            description: "Please accept the Provider Agreement in your profile to add a new service.",
            variant: "destructive",
        });
        return;
    }
    router.push('/vendor/services/new');
  }

  const handleEditService = (serviceId: string, isReal: boolean) => {
    if (isReal) {
      router.push(`/vendor/services/${serviceId}/edit`);
    } else {
      toast({ title: 'Demo Service', description: 'Create a real service to edit it.' });
    }
  };

  const handlePauseService = async (serviceId: string, currentStatus: string, isReal: boolean) => {
    if (!isReal) {
      toast({ title: 'Demo Service', description: 'Create a real service to manage it.' });
      return;
    }
    if (!firestore) return;
    const newStatus = currentStatus.toLowerCase() === 'active' ? 'paused' : 'active';
    try {
      await updateDoc(doc(firestore, 'services', serviceId), { status: newStatus, updatedAt: serverTimestamp() });
      setFirestoreServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } : s));
      toast({ title: newStatus === 'active' ? 'Service Published' : 'Service Paused' });
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

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

  const getPartnerStatus = (partnerId: string): ConnectionStatus => {
    if (confirmedBookings.some(b => b.partnerId === partnerId)) return 'Booked';
    const request = connectionRequests.find(r => r.partnerId === partnerId);
    if (request) {
        if (request.status === 'New Request') return 'New Request';
        if (request.status === 'Awaiting Response') return 'Connection Requested';
    }
    return 'Not Connected';
  };
  
  const handleConnect = (partner: Guide | Host) => {
      if (!isAgreementAccepted) {
        toast({
            title: "Provider Agreement Required",
            description: "Please accept the Provider Agreement in your profile to connect with partners.",
            variant: "destructive",
        });
        return;
      }
      const existingStatus = getPartnerStatus(partner.id);
      if (existingStatus !== 'Not Connected' && existingStatus !== 'Declined') {
          toast({
              title: 'Already Connected',
              description: `You're already in contact with ${partner.name}.`,
          });
          return;
      }
      
      const newRequest = {
          id: `cr-${Date.now()}`,
          partnerId: partner.id,
          name: partner.name,
          // @ts-ignore
          role: 'specialty' in partner ? 'Guide' : 'Host',
          regarding: 'Your Services', // Placeholder
          status: 'Connection Requested' as const,
      };

      setConnectionRequests(prev => [...prev, newRequest]);
      
      toast({
          title: 'Connection Requested!',
          description: `You've sent a connection request to ${partner.name}.`,
      });
  };
  
  const handleViewPartnerMessage = (partner: Guide | Host) => {
      const req = connectionRequests.find(c => c.partnerId === partner.id);
      if (req?.id) {
          handleViewMessage(req.id);
      } else {
          toast({
              title: 'No Message Thread',
              description: "Start a conversation by connecting with them first.",
          });
      }
  };


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="md:mr-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-beige">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg font-body">Provide services that elevate retreat experiences.</p>
        </div>

        <div className="relative h-[104px] w-[420px] hidden lg:block mx-auto flex-shrink-0 rounded-xl shadow-md overflow-hidden">
            <Image
                src={vendorHeroImage}
                alt={'A table with vendor offerings'}
                fill
                className="object-cover"
                style={{ objectPosition: 'center center' }}
            />
        </div>

        <div className="flex-grow"></div>

        <div className="flex items-center gap-4 mt-4 md:mt-0 flex-shrink-0">
            <Button size="lg" onClick={handleAddNewService} disabled={!isAgreementAccepted} title={!isAgreementAccepted ? "Please accept the Provider Agreement to add a new service" : ""}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Service
            </Button>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Your Performance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Profile Views" value="1.2k" icon={<Eye className="h-4 w-4 text-muted-foreground" />} description="in the last 30 days" />
            <StatCard title="Connection Requests" value="+23" icon={<Users className="h-4 w-4 text-muted-foreground" />} description="in the last 30 days" />
            <StatCard title="Active Conversations" value="8" icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} description="Awaiting your response" />
            <StatCard title="Bookings Confirmed" value="5" icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} description="in the last 90 days" />
            <StatCard title="Total Earnings" value="$12,845" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="All-time earnings" />
        </div>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Your Services</CardTitle>
          <CardDescription>Manage your offered services and availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Service Area</TableHead>
                <TableHead>Starting Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yourServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>{service.serviceArea}</TableCell>
                  <TableCell>${service.startingPrice}</TableCell>
                   <TableCell>
                    <Badge variant={service.status === 'Active' ? 'default' : 'secondary'}>{service.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditService(service.id, !!service.isFirestore)}>Edit Service</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePauseService(service.id, service.status, !!service.isFirestore)}>
                            {service.status.toLowerCase() === 'active' ? 'Pause Listing' : 'Publish Listing'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="space-y-12">
        <Card id="matches-section">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Matches Available</CardTitle>
                <CardDescription className="font-body text-base">These are guides and hosts that fit what you’re looking for.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="guides">
                    <TabsList className="grid w-full grid-cols-2 bg-primary text-primary-foreground h-auto">
                        <TabsTrigger value="guides" className="text-base py-2.5">Guides (Retreat Leaders)</TabsTrigger>
                        <TabsTrigger value="hosts" className="text-base py-2.5">Hosts (Local Spaces)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="guides" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {guideFiltersVisible && (
                                <div className="lg:col-span-1">
                                    <VendorGuideFilters 
                                        filters={guideFilters}
                                        onFiltersChange={handleGuideFilterChange}
                                        onApply={handleApplyGuideFilters}
                                        onReset={handleResetGuideFilters}
                                        isDirty={guideFiltersDirty}
                                    />
                                </div>
                            )}
                            <div className={cn(guideFiltersVisible ? "lg:col-span-3" : "lg:col-span-4")}>
                                <div className="flex justify-between items-center mb-4">
                                    <div className='flex items-center gap-4'>
                                        <Button onClick={() => setGuideFiltersVisible(!guideFiltersVisible)} variant="outline">
                                            <Filter className="mr-2 h-4 w-4" />
                                            {guideFiltersVisible ? 'Hide' : 'Show'} Filters
                                            {!guideFiltersVisible && appliedGuideFiltersCount > 0 && (
                                                <Badge variant="secondary" className="ml-2">{appliedGuideFiltersCount}</Badge>
                                            )}
                                        </Button>
                                        <h3 className="font-headline text-2xl hidden sm:block">{displayedGuides.length} Matching {displayedGuides.length === 1 ? 'Guide' : 'Guides'}</h3>
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
                                <h3 className="font-headline text-2xl sm:hidden mb-4">{displayedGuides.length} Matching {displayedGuides.length === 1 ? 'Guide' : 'Guides'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {displayedGuides.map(guide => (
                                        <GuideCard 
                                            key={guide.id} 
                                            guide={guide}
                                            onConnect={handleConnect}
                                            onViewMessage={handleViewPartnerMessage}
                                            connectionStatus={getPartnerStatus(guide.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="hosts" className="mt-6">
                       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {hostFiltersVisible && (
                                <div className="lg:col-span-1">
                                    <VendorHostFilters
                                        filters={hostFilters}
                                        onFiltersChange={handleHostFilterChange}
                                        onApply={handleApplyHostFilters}
                                        onReset={handleResetHostFilters}
                                        isDirty={hostFiltersDirty}
                                    />
                                </div>
                            )}
                            <div className={cn(hostFiltersVisible ? "lg:col-span-3" : "lg:col-span-4")}>
                                 <div className="flex justify-between items-center mb-4">
                                    <div className='flex items-center gap-4'>
                                        <Button onClick={() => setHostFiltersVisible(!hostFiltersVisible)} variant="outline">
                                            <Filter className="mr-2 h-4 w-4" />
                                            {hostFiltersVisible ? 'Hide' : 'Show'} Filters
                                            {!hostFiltersVisible && appliedHostFiltersCount > 0 && (
                                                <Badge variant="secondary" className="ml-2">{appliedHostFiltersCount}</Badge>
                                            )}
                                        </Button>
                                     <h3 className="font-headline text-2xl hidden sm:block">{displayedHosts.length} Matching {displayedHosts.length === 1 ? 'Host' : 'Hosts'}</h3>
                                    </div>
                                    <Select value={hostSortOption} onValueChange={setHostSortOption}>
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
                                 <h3 className="font-headline text-2xl sm:hidden mb-4">{displayedHosts.length} Matching {displayedHosts.length === 1 ? 'Host' : 'Hosts'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {displayedHosts.map(host => (
                                        <HostCard 
                                            key={host.id} 
                                            host={host}
                                            onConnect={handleConnect}
                                            onViewMessage={handleViewPartnerMessage}
                                            connectionStatus={getPartnerStatus(host.id)}
                                            connectActionLabel="Connect"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Connections Requested</CardTitle>
                <CardDescription className="font-body text-base">These are people you’ve reached out to or who have requested to connect with you.</CardDescription>
            </CardHeader>
            <CardContent>
                {connectionRequests.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Regarding</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {connectionRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.name}</TableCell>
                                    <TableCell>{req.role}</TableCell>
                                    <TableCell>{req.regarding}</TableCell>
                                    <TableCell><Badge variant={req.status === 'New Request' ? 'default' : 'secondary'}>{req.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleViewMessage(req.id)}>View Message</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12 rounded-lg bg-secondary/50">
                        <p className="text-muted-foreground">No connection requests yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Confirmed Bookings</CardTitle>
                <CardDescription className="font-body text-base">These are your confirmed retreat relationships and bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                 {confirmedBookings.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {confirmedBookings.map(booking => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.clientName}</TableCell>
                                    <TableCell>{booking.clientRole}</TableCell>
                                    <TableCell>{booking.service}</TableCell>
                                    <TableCell>{booking.dates}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">View Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center py-12 rounded-lg bg-secondary/50">
                        <p className="text-muted-foreground">No confirmed bookings yet — you’re building momentum.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      
        <Card>
            <CardHeader>
                <CardTitle>Local Partnerships</CardTitle>
                <CardDescription>Create suggested retreat packages for guides by bundling your services with preferred local hosts.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-12">
                <p>(Coming Soon)</p>
                <Button className="mt-4" variant="secondary">Manage Packaged Services</Button>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

    