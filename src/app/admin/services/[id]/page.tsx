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

export default function AdminServiceDetailPage() {
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

  const fetchService = useCallback(async () => {
    if (currentUser.status !== 'authenticated') return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const result = await res.json();
      setData(result);
      setFields({
        name: result.service.name || '',
        description: result.service.description || '',
        category: result.service.category || '',
        status: result.service.status || 'draft',
        startingPrice: result.service.startingPrice || 0,
      });
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.status, id, getToken]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Save failed'}`);
        return;
      }
      await fetchService();
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
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Delete failed'}`);
        return;
      }
      router.push('/admin/services');
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

  if (!data?.service) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Service not found.</p>
      </div>
    );
  }

  const { service, vendorName } = data;

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/admin/services"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Services</Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline text-2xl font-bold">{service.name || 'Untitled Service'}</h1>
          <p className="text-muted-foreground">
            by <Link href={`/admin/users/${service.vendorId}`} className="hover:underline">{vendorName}</Link>
            {' '}&middot;{' '}
            <Badge variant="secondary" className="capitalize">{service.status}</Badge>
            {service.category && <> &middot; {service.category}</>}
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
                <AlertDialogTitle>Delete Service</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{service.name}&rdquo;. This action cannot be undone.
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
          <CardHeader><CardTitle>Edit Service</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={fields.name} onChange={e => setFields(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={fields.category} onChange={e => setFields(p => ({ ...p, category: e.target.value }))} />
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
                <Label htmlFor="startingPrice">Starting Price ($)</Label>
                <Input id="startingPrice" type="number" value={fields.startingPrice} onChange={e => setFields(p => ({ ...p, startingPrice: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={fields.description} onChange={e => setFields(p => ({ ...p, description: e.target.value }))} rows={6} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Category:</span> {service.category || '-'}</div>
                <div><span className="text-muted-foreground">Status:</span> {service.status || '-'}</div>
                <div><span className="text-muted-foreground">Starting Price:</span> ${service.startingPrice || 0}</div>
                <div><span className="text-muted-foreground">Created:</span> {formatDate(service.createdAt)}</div>
              </div>
            </CardContent>
          </Card>

          {service.description && (
            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{service.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Raw Data</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-96 bg-secondary p-4 rounded-lg">
                {JSON.stringify(service, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
