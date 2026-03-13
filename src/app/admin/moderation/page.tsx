'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, Flag, EyeOff, Mountain, Home, Package } from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'retreat' | 'space' | 'service';
  title: string;
  ownerId: string;
  ownerName: string;
  status: string;
  moderationStatus: string;
  createdAt: string;
  locationDescription?: string;
  price?: number;
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'retreat': return <Mountain className="h-4 w-4" />;
    case 'space': return <Home className="h-4 w-4" />;
    case 'service': return <Package className="h-4 w-4" />;
    default: return null;
  }
};

const moderationBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge variant="default" className="bg-green-600">Approved</Badge>;
    case 'flagged':
      return <Badge variant="destructive">Flagged</Badge>;
    case 'unpublished':
      return <Badge variant="secondary">Unpublished</Badge>;
    default:
      return <Badge variant="outline">Unreviewed</Badge>;
  }
};

export default function AdminModerationPage() {
  const currentUser = useUser();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('published');

  const fetchItems = async () => {
    if (currentUser.status !== 'authenticated') return;
    setLoading(true);
    try {
      const token = await (currentUser.data as any)?.getIdToken();
      const params = new URLSearchParams({ type: typeFilter, status: statusFilter });
      const res = await fetch(`/api/admin/moderation?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching moderation items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentUser.status, typeFilter, statusFilter]);

  const handleAction = async (itemId: string, itemType: string, action: 'approve' | 'flag' | 'unpublish') => {
    setActionLoading(`${itemId}-${action}`);
    try {
      const token = await (currentUser.data as any)?.getIdToken();
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, itemType, action }),
      });
      if (!res.ok) throw new Error('Action failed');
      // Refresh the list
      await fetchItems();
    } catch (error) {
      console.error('Moderation action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const counts = {
    total: items.length,
    unreviewed: items.filter(i => i.moderationStatus === 'unreviewed').length,
    flagged: items.filter(i => i.moderationStatus === 'flagged').length,
    approved: items.filter(i => i.moderationStatus === 'approved').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-3xl font-bold mb-6">Content Moderation</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Listings</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{counts.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Unreviewed</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{counts.unreviewed}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Flagged</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{counts.flagged}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{counts.approved}</p></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Listing type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="retreats">Retreats</SelectItem>
            <SelectItem value="spaces">Spaces</SelectItem>
            <SelectItem value="services">Services</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="all">All Statuses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings table */}
      <Card>
        <CardHeader>
          <CardTitle>Listings</CardTitle>
          <CardDescription>Review and moderate provider content</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No listings found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Moderation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {typeIcon(item.type)}
                        <span className="text-xs capitalize">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{item.title}</TableCell>
                    <TableCell className="text-sm">{item.ownerName}</TableCell>
                    <TableCell className="text-sm">{item.price ? `$${item.price}` : '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{item.status}</Badge></TableCell>
                    <TableCell>{moderationBadge(item.moderationStatus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {item.moderationStatus !== 'approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-green-600 hover:text-green-700"
                            disabled={actionLoading === `${item.id}-approve`}
                            onClick={() => handleAction(item.id, item.type, 'approve')}
                          >
                            {actionLoading === `${item.id}-approve` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            Approve
                          </Button>
                        )}
                        {item.moderationStatus !== 'flagged' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            disabled={actionLoading === `${item.id}-flag`}
                            onClick={() => handleAction(item.id, item.type, 'flag')}
                          >
                            {actionLoading === `${item.id}-flag` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Flag className="h-3 w-3 mr-1" />
                            )}
                            Flag
                          </Button>
                        )}
                        {item.status === 'published' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            disabled={actionLoading === `${item.id}-unpublish`}
                            onClick={() => handleAction(item.id, item.type, 'unpublish')}
                          >
                            {actionLoading === `${item.id}-unpublish` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <EyeOff className="h-3 w-3 mr-1" />
                            )}
                            Unpublish
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
