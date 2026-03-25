'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminRetreatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const currentUser = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fields, setFields] = useState<Record<string, any>>({});

  const getToken = useCallback(async () => {
    return await (currentUser.data as any)?.getIdToken();
  }, [currentUser.data]);

  const fetchRetreat = useCallback(async () => {
    if (currentUser.status !== 'authenticated') return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/retreats/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const result = await res.json();
      setData(result);
      setFields({
        title: result.retreat.title || '',
        description: result.retreat.description || '',
        type: result.retreat.type || '',
        status: result.retreat.status || 'draft',
        locationDescription: result.retreat.locationDescription || '',
        costPerPerson: result.retreat.costPerPerson || 0,
        capacity: result.retreat.capacity || 0,
        startDate: result.retreat.startDate || '',
        endDate: result.retreat.endDate || '',
        included: result.retreat.included || '',
      });
    } catch (error) {
      console.error('Error fetching retreat:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.status, id, getToken]);

  useEffect(() => {
    fetchRetreat();
  }, [fetchRetreat]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/retreats/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Save failed'}`);
        return;
      }
      await fetchRetreat();
      setEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/retreats/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Delete failed'}`);
        return;
      }
      router.push('/admin/retreats');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!data?.retreat) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Retreat not found.</p>
      </div>
    );
  }

  const { retreat, hostName } = data;

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/admin/retreats"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Retreats</Link>
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline text-2xl font-bold">{retreat.title || 'Untitled Retreat'}</h1>
          <p className="text-muted-foreground">
            by <Link href={`/admin/users/${retreat.hostId}`} className="hover:underline">{hostName}</Link>
            {' '}&middot;{' '}
            <Badge variant="secondary" className="capitalize">{retreat.status}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                Save
              </Button>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Retreat</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{retreat.title}&rdquo;. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardHeader><CardTitle>Edit Retreat</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={fields.title} onChange={e => setFields(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input id="type" value={fields.type} onChange={e => setFields(p => ({ ...p, type: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={fields.status} onValueChange={v => setFields(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="locationDescription">Location</Label>
                <Input id="locationDescription" value={fields.locationDescription} onChange={e => setFields(p => ({ ...p, locationDescription: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="costPerPerson">Price per Person ($)</Label>
                <Input id="costPerPerson" type="number" value={fields.costPerPerson} onChange={e => setFields(p => ({ ...p, costPerPerson: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" value={fields.capacity} onChange={e => setFields(p => ({ ...p, capacity: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" value={fields.startDate} onChange={e => setFields(p => ({ ...p, startDate: e.target.value }))} placeholder="YYYY-MM-DD" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" value={fields.endDate} onChange={e => setFields(p => ({ ...p, endDate: e.target.value }))} placeholder="YYYY-MM-DD" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={fields.description} onChange={e => setFields(p => ({ ...p, description: e.target.value }))} rows={6} />
            </div>
            <div>
              <Label htmlFor="included">What&apos;s Included</Label>
              <Textarea id="included" value={fields.included} onChange={e => setFields(p => ({ ...p, included: e.target.value }))} rows={3} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Type:</span> {retreat.type || '-'}</div>
                <div><span className="text-muted-foreground">Status:</span> {retreat.status || '-'}</div>
                <div><span className="text-muted-foreground">Location:</span> {retreat.locationDescription || '-'}</div>
                <div><span className="text-muted-foreground">Price:</span> ${retreat.costPerPerson || 0}/person</div>
                <div><span className="text-muted-foreground">Capacity:</span> {retreat.capacity || '-'}</div>
                <div><span className="text-muted-foreground">Dates:</span> {retreat.startDate || '-'} to {retreat.endDate || '-'}</div>
                <div><span className="text-muted-foreground">Created:</span> {formatDate(retreat.createdAt)}</div>
                <div><span className="text-muted-foreground">Updated:</span> {formatDate(retreat.updatedAt)}</div>
              </div>
            </CardContent>
          </Card>

          {retreat.description && (
            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{retreat.description}</p>
              </CardContent>
            </Card>
          )}

          {retreat.included && (
            <Card>
              <CardHeader><CardTitle>What&apos;s Included</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{retreat.included}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Raw Data</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-96 bg-secondary p-4 rounded-lg">
                {JSON.stringify(retreat, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
