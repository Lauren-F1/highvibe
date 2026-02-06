'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, BarChart, Users, DollarSign, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { placeholderImages } from '@/lib/placeholder-images';
import { PaywallModal } from '@/components/paywall-modal';
import { RequestConnectionModal } from '@/components/request-connection-modal';
import { vendors } from '@/lib/mock-data';
import { VendorCard } from '@/components/vendor-card';
import { VendorFilters } from '@/components/vendor-filters';
import { GuideCard, type Guide } from '@/components/guide-card';
import { GuideFilters } from '@/components/guide-filters';


const genericImage = placeholderImages.find(p => p.id === 'generic-placeholder')!;

const hostSpaces = [
  { id: 'space1', name: 'The Glass House', location: 'Topanga, California', capacity: 25, rate: 2200, status: 'Published', bookings: 3, image: placeholderImages.find(p => p.id === 'modern-event-space')! },
  { id: 'space2', name: 'Sacred Valley Hacienda', location: 'Cusco, Peru', capacity: 18, rate: 1500, status: 'Published', bookings: 5, image: placeholderImages.find(p => p.id === 'hacienda-leather-interior')! },
  { id: 'space3', name: 'Mountain View Lodge', location: 'Asheville, North Carolina', capacity: 40, rate: 3500, status: 'Draft', bookings: 0, image: placeholderImages.find(p => p.id === 'mountain-hike')! },
];

const matchingGuides: Guide[] = [
  { id: 'g1', name: 'Asha Sharma', specialty: 'Yoga & Meditation', rating: 4.9, reviewCount: 45, upcomingRetreatsCount: 3, avatar: placeholderImages.find(p => p.id === 'vendor-yoga-teacher-profile')! },
  { id: 'g2', name: 'Marcus Green', specialty: 'Adventure & Leadership', rating: 5.0, reviewCount: 32, upcomingRetreatsCount: 2, avatar: placeholderImages.find(p => p.id === 'vendor-photographer')! },
  { id: 'g3', name: 'Isabella Rossi', specialty: 'Culinary & Wellness', rating: 4.8, reviewCount: 60, upcomingRetreatsCount: 4, avatar: placeholderImages.find(p => p.id === 'vendor-chef-profile')! },
];

const localVendors = vendors.slice(0, 3);

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

export default function HostPage() {
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(hostSpaces[0]?.id || null);
  const [isPaywallOpen, setPaywallOpen] = useState(false);
  const [connectionModal, setConnectionModal] = useState<{isOpen: boolean, name: string, role: 'Host' | 'Vendor' | 'Guide'}>({isOpen: false, name: '', role: 'Guide'});

  const handleConnectClick = (name: string, role: 'Host' | 'Vendor' | 'Guide') => {
    setConnectionModal({ isOpen: true, name, role });
  }

  const handleAddNewSpace = () => {
      alert("Navigate to 'Add New Space' page.");
  }
  
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
          <p className="text-muted-foreground mt-2 text-lg font-body">Manage your spaces and connect with your next opportunity.</p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0" onClick={handleAddNewSpace}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Space
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
                <TableRow key={space.id} className={activeSpaceId === space.id ? 'bg-accent' : ''}>
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
                    <Button variant="outline" size="sm" onClick={() => setActiveSpaceId(space.id)}>View Matches</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
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
      
       <div id="matches-section" className="mb-12">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Matches for Your Space</CardTitle>
                <CardDescription className="font-body text-base">Find the right guides and local vendors to partner with.</CardDescription>
                <div className="!mt-6 max-w-sm">
                    <Select onValueChange={setActiveSpaceId} value={activeSpaceId || ''}>
                        <SelectTrigger id="space-selector" className="text-lg py-6">
                            <SelectValue placeholder="Select a space to find matches..." />
                        </SelectTrigger>
                        <SelectContent>
                            {hostSpaces.map(space => (
                            <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {activeSpaceId ? (
                     <Tabs defaultValue="guides">
                        <TabsList className="grid w-full grid-cols-2 bg-primary text-primary-foreground">
                            <TabsTrigger value="guides">Guides (Retreat Leaders)</TabsTrigger>
                            <TabsTrigger value="vendors">Vendors (Local Partners)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="guides" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-1">
                                    <GuideFilters />
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-headline text-2xl">Recommended Guides</h3>
                                        <Select defaultValue="recommended">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {matchingGuides.map(guide => <GuideCard key={guide.id} guide={guide} onConnect={() => handleConnectClick(guide.name, 'Guide')} />)}
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
                                        <h3 className="font-headline text-2xl">Find Local Partners</h3>
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
                                     <p className="text-muted-foreground mb-4">Discover local vendors to elevate your guests' experience.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {localVendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} onConnect={() => handleConnectClick(vendor.name, 'Vendor')} />)}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Please select a space to see matches.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Local Partnerships</CardTitle>
            <CardDescription>Create suggested retreat packages for guides by bundling your space with preferred local vendors.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-12">
            <p>(Coming Soon)</p>
            <Button className="mt-4" variant="secondary">Manage Preferred Partners</Button>
        </CardContent>
      </Card>
    </div>
  );
}
