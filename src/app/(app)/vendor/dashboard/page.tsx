
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, Eye, Users, MessageSquare, CheckCircle, DollarSign, MoreHorizontal } from 'lucide-react';
import { yourServices, matchingGuidesForVendor, matchingHostsForVendor, type Guide, type Host } from '@/lib/mock-data';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { GuideCard } from '@/components/guide-card';
import { HostCard } from '@/components/host-card';
import { VendorGuideFilters } from '@/components/vendor-guide-filters';
import { VendorHostFilters } from '@/components/vendor-host-filters';
import { useToast } from '@/hooks/use-toast';
import { type ConnectionStatus } from '@/components/guide-card';

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

export default function VendorDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [connectionRequests, setConnectionRequests] = useState(initialConnectionRequests);
  const [confirmedBookings, setConfirmedBookings] = useState(initialConfirmedBookings);


  const handleAddNewService = () => {
    alert("Navigate to 'Add New Service' page.");
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
          status: 'Awaiting Response' as const,
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
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-beige">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg font-body">Provide services that elevate retreat experiences.</p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0" onClick={handleAddNewService}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Service
        </Button>
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
                          <DropdownMenuItem onClick={() => alert('Edit clicked')}>Edit Service</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Update availability clicked')}>Update Availability</DropdownMenuItem>
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
      
      <div className="space-y-12">
        <Card id="matches-section">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Matches Available</CardTitle>
                <CardDescription className="font-body text-base">These are guides and hosts that fit what you’re looking for.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="guides">
                    <TabsList className="grid w-full grid-cols-2 bg-primary text-primary-foreground">
                        <TabsTrigger value="guides">Guides (Retreat Leaders)</TabsTrigger>
                        <TabsTrigger value="hosts">Hosts (Local Spaces)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="guides" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1">
                                <VendorGuideFilters />
                            </div>
                            <div className="lg:col-span-3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-headline text-2xl">{matchingGuidesForVendor.length} Matching {matchingGuidesForVendor.length === 1 ? 'Guide' : 'Guides'}</h3>
                                    <p className="text-xs text-muted-foreground">Counts update as you filter.</p>
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
                                    {matchingGuidesForVendor.map(guide => (
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
                            <div className="lg:col-span-1">
                                <VendorHostFilters />
                            </div>
                            <div className="lg:col-span-3">
                                 <div className="flex justify-between items-center mb-4">
                                     <h3 className="font-headline text-2xl">{matchingHostsForVendor.length} Matching {matchingHostsForVendor.length === 1 ? 'Host' : 'Hosts'}</h3>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {matchingHostsForVendor.map(host => (
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
