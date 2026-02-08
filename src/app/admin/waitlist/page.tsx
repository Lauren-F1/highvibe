'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, MoreHorizontal, Download, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/csv';

type WaitlistSeeker = {
  id: string;
  email: string;
  createdAt: Timestamp;
  sourcePage: string;
  filtersSnapshot: {
    experienceType: string;
    destination: string;
    regionCountry: string;
    investmentRange: string;
    timing: string;
  };
  status: 'active' | 'unsubscribed';
};

export default function WaitlistAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [waitlist, setWaitlist] = useState<WaitlistSeeker[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [emailSearch, setEmailSearch] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchWaitlist = async () => {
    if (!firestore) return;
    setLoading(true);

    const waitlistCol = collection(firestore, 'waitlist_seekers');
    let q = query(waitlistCol, orderBy('createdAt', 'desc'));

    // The free version of firestore does not support multiple query constraints, so filtering is done client-side
    // For a production app, upgrade firestore or use a dedicated search service like Algolia.

    try {
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
        } as WaitlistSeeker));
        setWaitlist(data);
    } catch (error) {
        console.error("Error fetching waitlist:", error);
        toast({
            variant: "destructive",
            title: "Failed to fetch waitlist",
            description: "Could not load data from Firestore.",
        });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const filteredWaitlist = useMemo(() => {
    return waitlist.filter(item => {
        const emailMatch = emailSearch === '' || item.email.toLowerCase().includes(emailSearch.toLowerCase());
        const experienceMatch = experienceFilter === 'all' || item.filtersSnapshot?.experienceType === experienceFilter;
        const destinationMatch = destinationFilter === 'all' || item.filtersSnapshot?.destination === destinationFilter;
        const statusMatch = statusFilter === 'all' || item.status === statusFilter;
        
        const dateMatch = (() => {
            if (dateFilter === 'all' || !item.createdAt) return true;
            const daysAgo = parseInt(dateFilter, 10);
            const itemDate = item.createdAt.toDate();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
            return itemDate >= cutoffDate;
        })();
        
        return emailMatch && experienceMatch && destinationMatch && statusMatch && dateMatch;
    });
  }, [waitlist, emailSearch, experienceFilter, destinationFilter, dateFilter, statusFilter]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({
      description: `Copied "${email}" to clipboard.`,
    });
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'unsubscribed') => {
    if (!firestore) return;
    const itemRef = doc(firestore, 'waitlist_seekers', id);
    try {
        await updateDoc(itemRef, { status: newStatus });
        await fetchWaitlist(); // Refetch to get updated data
        toast({
            title: "Status Updated",
            description: `Entry marked as ${newStatus}.`,
        });
    } catch (error) {
        console.error("Error updating status:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the entry's status.",
        });
    }
  };

  const handleExport = () => {
    if (filteredWaitlist.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nothing to export',
        description: 'There are no entries matching the current filters.',
      });
      return;
    }

    const csvData = filteredWaitlist.map(item => ({
      email: item.email,
      createdAt: item.createdAt?.toDate().toISOString() ?? '',
      sourcePage: item.sourcePage,
      experienceType: item.filtersSnapshot?.experienceType || '',
      destination: item.filtersSnapshot?.destination || '',
      regionCountry: item.filtersSnapshot?.regionCountry || '',
      investmentRange: item.filtersSnapshot?.investmentRange || '',
      timing: item.filtersSnapshot?.timing || '',
      status: item.status,
    }));
    
    exportToCsv(csvData, 'waitlist_export.csv');
    toast({
        title: "Export Started",
        description: `${csvData.length} records are being downloaded.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Waitlist Admin</CardTitle>
          <CardDescription>Manage and export waitlist signups.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Search by email..."
                value={emailSearch}
                onChange={e => setEmailSearch(e.target.value)}
              />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger><SelectValue placeholder="Filter by date..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
               <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                </SelectContent>
              </Select>
               <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Signup Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Filters</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                ) : filteredWaitlist.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">No entries found.</TableCell></TableRow>
                ) : (
                  filteredWaitlist.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.email}</TableCell>
                      <TableCell>{item.createdAt?.toDate().toLocaleDateString()}</TableCell>
                      <TableCell>{item.sourcePage}</TableCell>
                      <TableCell>
                        <ul className="text-xs text-muted-foreground">
                            {Object.entries(item.filtersSnapshot || {}).map(([key, value]) => value && <li key={key}>{key}: {value}</li>)}
                        </ul>
                      </TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyEmail(item.email)}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'unsubscribed')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark Unsubscribed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
