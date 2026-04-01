'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface OutreachRecord {
  id: string;
  vendorEmail: string;
  vendorName: string;
  vendorCategory: string;
  location: string;
  outreachType: 'vendor' | 'host';
  source: string;
  status: 'sent' | 'followed_up' | 'signed_up' | 'unsubscribed' | 'opened' | 'manual_needed';
  contactMethod?: 'email' | 'form' | 'none';
  website?: string;
  phone?: string;
  relevanceScore?: number;
  relevanceReason?: string;
  failReason?: string;
  manifestationId?: string;
  sentAt: string;
  followUpSentAt?: string;
  signedUpAt?: string;
}

interface ScoutStats {
  total: number;
  sent: number;
  followed_up: number;
  signed_up: number;
  unsubscribed: number;
  manual_needed: number;
  conversionRate: number;
  byType: { host: number; vendor: number };
}

export default function AdminScoutPage() {
  const user = useUser();
  const [records, setRecords] = useState<OutreachRecord[]>([]);
  const [stats, setStats] = useState<ScoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (user.status !== 'authenticated') return;
    setLoading(true);
    try {
      const token = await (user.data as any)?.getIdToken?.();
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/scout?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRecords(data.records);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch scout data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter, typeFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      sent: 'bg-blue-100 text-blue-800',
      followed_up: 'bg-yellow-100 text-yellow-800',
      signed_up: 'bg-green-100 text-green-800',
      unsubscribed: 'bg-red-100 text-red-800',
      opened: 'bg-purple-100 text-purple-800',
      manual_needed: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'manual_needed' ? 'needs manual outreach' : status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-headline mb-6">Scout Outreach</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Sent</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Awaiting Response</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.sent}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Followed Up</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.followed_up}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Signed Up</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-green-600">{stats.signed_up}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Needs Manual Outreach</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-orange-600">{stats.manual_needed}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p></CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="manual_needed">Needs Manual Outreach</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="followed_up">Followed Up</SelectItem>
            <SelectItem value="signed_up">Signed Up</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="host">Hosts</SelectItem>
            <SelectItem value="vendor">Vendors</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Location</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Sent</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-medium">{record.vendorName}</td>
                <td className="p-3 text-muted-foreground">
                  {record.vendorEmail || (
                    <span className="space-y-1">
                      {record.website && (
                        <a href={record.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block text-xs">
                          Website
                        </a>
                      )}
                      {record.phone && <span className="block text-xs">{record.phone}</span>}
                      {!record.website && !record.phone && <span className="text-xs italic">No contact info</span>}
                    </span>
                  )}
                </td>
                <td className="p-3 capitalize">{record.outreachType}</td>
                <td className="p-3">{record.vendorCategory}</td>
                <td className="p-3">{record.location}</td>
                <td className="p-3">
                  {statusBadge(record.status)}
                  {record.relevanceScore && record.status === 'manual_needed' && (
                    <span className="ml-1 text-xs text-muted-foreground">{record.relevanceScore}% fit</span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">
                  {record.sentAt ? new Date(record.sentAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {records.length === 0 && !loading && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No outreach records found.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
