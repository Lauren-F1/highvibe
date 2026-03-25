'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RetreatRow {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  status: string;
  locationDescription: string;
  costPerPerson: number;
  capacity: number;
  type: string;
  createdAt: string;
}

export default function AdminRetreatsPage() {
  const currentUser = useUser();
  const [items, setItems] = useState<RetreatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchItems = useCallback(async (cursor?: string, append = false) => {
    if (currentUser.status !== 'authenticated') return;
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const token = await (currentUser.data as any)?.getIdToken();
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(`/api/admin/retreats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Error fetching retreats:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentUser.status, currentUser.data, search, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default' as const;
      case 'draft': return 'secondary' as const;
      case 'paused': return 'outline' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-3xl font-bold mb-6">Retreats</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No retreats found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Guide</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{item.title}</TableCell>
                    <TableCell>
                      <Link href={`/admin/users/${item.hostId}`} className="text-sm hover:underline">
                        {item.hostName}
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant={statusBadgeVariant(item.status)} className="capitalize">{item.status}</Badge></TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate">{item.locationDescription || '-'}</TableCell>
                    <TableCell>${item.costPerPerson}</TableCell>
                    <TableCell>{item.capacity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/retreats/${item.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {nextCursor && items.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => fetchItems(nextCursor, true)} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
