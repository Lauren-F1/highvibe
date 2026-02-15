'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, MoreHorizontal, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/csv';
import { Badge } from '@/components/ui/badge';

type WaitlistSubmission = {
  id: string;
  email: string;
  firstName?: string;
  roleInterest?: string;
  source: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'new';
  submitCount: number;
};

export default function WaitlistAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [waitlist, setWaitlist] = useState<WaitlistSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [emailSearch, setEmailSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchWaitlist = async () => {
    if (!firestore) return;
    setLoading(true);

    const waitlistCol = collection(firestore, 'waitlist');
    let q = query(waitlistCol, orderBy('createdAt', 'desc'));

    try {
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
        } as WaitlistSubmission));
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
        const roleMatch = roleFilter === 'all' || item.roleInterest === roleFilter;
        const statusMatch = statusFilter === 'all' || item.status === statusFilter;
        
        const dateMatch = (() => {
            if (dateFilter === 'all' || !item.createdAt) return true;
            const daysAgo = parseInt(dateFilter, 10);
            const itemDate = item.createdAt.toDate();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
            return itemDate >= cutoffDate;
        })();
        
        return emailMatch && roleMatch && dateMatch && statusMatch;
    });
  }, [waitlist, emailSearch, roleFilter, dateFilter, statusFilter]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({
      description: `Copied "${email}" to clipboard.`,
    });
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
      firstName: item.firstName || '',
      roleInterest: item.roleInterest || '',
      createdAt: item.createdAt?.toDate().toISOString() ?? '',
      updatedAt: item.updatedAt?.toDate().toISOString() ?? '',
      source: item.source,
      status: item.status,
      submitCount: item.submitCount,
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
          <CardTitle className="text-3xl font-headline">Waitlist Submissions</CardTitle>
          <CardDescription>Manage and export general waitlist signups.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger><SelectValue placeholder="Filter by role..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Seeker">Seeker</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Host">Host</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                  <SelectItem value="Not sure">Not sure</SelectItem>
                </SelectContent>
              </Select>
               <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>
               <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role Interest</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submits</TableHead>
                  <TableHead>Last Submit</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center">Loading...</TableCell></TableRow>
                ) : filteredWaitlist.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center">No entries found.</TableCell></TableRow>
                ) : (
                  filteredWaitlist.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.createdAt?.toDate().toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{item.email}</TableCell>
                      <TableCell>{item.firstName}</TableCell>
                      <TableCell>{item.roleInterest}</TableCell>
                      <TableCell>{item.source}</TableCell>
                      <TableCell><Badge>{item.status}</Badge></TableCell>
                      <TableCell className="text-center">{item.submitCount}</TableCell>
                      <TableCell>{item.updatedAt?.toDate().toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyEmail(item.email)}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Email
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

    