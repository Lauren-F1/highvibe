'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { ArrowLeft, Loader2, Save, Shield, ShieldOff, UserX, Ban, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const ALL_ROLES = ['seeker', 'guide', 'host', 'vendor'] as const;

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const currentUser = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFields, setProfileFields] = useState({ displayName: '', email: '', bio: '', locationLabel: '' });

  const getToken = useCallback(async () => {
    return await (currentUser.data as any)?.getIdToken();
  }, [currentUser.data]);

  const fetchUser = useCallback(async () => {
    if (currentUser.status !== 'authenticated') return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/users/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const result = await res.json();
      setData(result);
      setProfileFields({
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        bio: result.user.bio || '',
        locationLabel: result.user.locationLabel || '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.status, uid, getToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const performAction = async (body: Record<string, unknown>) => {
    const actionName = body.action as string;
    setActionLoading(actionName);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Action failed'}`);
        return;
      }
      await fetchUser();
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (deleteContent: boolean) => {
    setActionLoading('delete');
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteContent }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Delete failed'}`);
        return;
      }
      router.push('/admin/users');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = (role: string) => {
    const currentRoles: string[] = data.user.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r: string) => r !== role)
      : [...currentRoles, role];
    if (newRoles.length === 0) return; // Must have at least one role
    performAction({ action: 'updateRoles', roles: newRoles });
  };

  const handleSaveProfile = () => {
    performAction({ action: 'updateProfile', fields: profileFields });
    setEditingProfile(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  const { user, retreats, spaces, bookings } = data;
  const roles: string[] = user.roles || [];

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/admin/users"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Users</Link>
      </Button>

      {/* Profile card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback className="text-lg">{(user.displayName || user.email || '?')[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-headline text-2xl font-bold">{user.displayName || 'No Name'}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                {roles.map((r: string) => (
                  <Badge key={r} className="capitalize">{r}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div><span className="text-muted-foreground">Signed up:</span> {formatDate(user.createdAt)}</div>
                <div><span className="text-muted-foreground">Last login:</span> {formatDate(user.lastLoginAt)}</div>
                {user.locationLabel && <div><span className="text-muted-foreground">Location:</span> {user.locationLabel}</div>}
                {user.bio && <div className="col-span-2"><span className="text-muted-foreground">Bio:</span> {user.bio}</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Roles */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Roles</Label>
            <div className="flex gap-2">
              {ALL_ROLES.map(role => (
                <Button
                  key={role}
                  variant={roles.includes(role) ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize"
                  disabled={actionLoading === 'updateRoles'}
                  onClick={() => handleToggleRole(role)}
                >
                  {actionLoading === 'updateRoles' ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  {role}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click to toggle roles on/off. At least one role is required.</p>
          </div>

          {/* Account actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!!actionLoading}
              onClick={() => performAction({ action: 'setAdmin', admin: true })}
            >
              {actionLoading === 'setAdmin' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
              Grant Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!!actionLoading}
              onClick={() => performAction({ action: 'setAdmin', admin: false })}
            >
              <ShieldOff className="h-3 w-3 mr-1" />
              Remove Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!!actionLoading}
              onClick={() => performAction({ action: 'toggleDisabled', disabled: true })}
            >
              <Ban className="h-3 w-3 mr-1" />
              Disable Account
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!!actionLoading}
              onClick={() => performAction({ action: 'toggleDisabled', disabled: false })}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Enable Account
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={!!actionLoading}>
                  <UserX className="h-3 w-3 mr-1" />
                  Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {user.displayName || user.email}&apos;s account. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteUser(false)}>
                    Delete Account Only
                  </AlertDialogAction>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDeleteUser(true)}
                  >
                    Delete Account + Content
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Edit Profile</CardTitle>
          {!editingProfile ? (
            <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingProfile(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={actionLoading === 'updateProfile'}>
                {actionLoading === 'updateProfile' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {editingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileFields.displayName}
                  onChange={e => setProfileFields(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileFields.email}
                  onChange={e => setProfileFields(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="locationLabel">Location</Label>
                <Input
                  id="locationLabel"
                  value={profileFields.locationLabel}
                  onChange={e => setProfileFields(prev => ({ ...prev, locationLabel: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={profileFields.bio}
                  onChange={e => setProfileFields(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {user.displayName || '-'}</div>
              <div><span className="text-muted-foreground">Email:</span> {user.email || '-'}</div>
              <div><span className="text-muted-foreground">Location:</span> {user.locationLabel || '-'}</div>
              <div className="md:col-span-2"><span className="text-muted-foreground">Bio:</span> {user.bio || '-'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile Data</TabsTrigger>
          {roles.includes('guide') && <TabsTrigger value="retreats">Retreats ({retreats.length})</TabsTrigger>}
          {roles.includes('host') && <TabsTrigger value="spaces">Spaces ({spaces.length})</TabsTrigger>}
          {roles.includes('seeker') && <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <pre className="text-xs overflow-auto max-h-96 bg-secondary p-4 rounded-lg">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {roles.includes('guide') && (
          <TabsContent value="retreats" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {retreats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No retreats created.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retreats.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.title || '-'}</TableCell>
                          <TableCell><Badge variant="secondary">{r.status || '-'}</Badge></TableCell>
                          <TableCell>{r.locationDescription || '-'}</TableCell>
                          <TableCell>${r.costPerPerson || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {roles.includes('host') && (
          <TabsContent value="spaces" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {spaces.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No spaces listed.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spaces.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name || '-'}</TableCell>
                          <TableCell><Badge variant="secondary">{s.status || '-'}</Badge></TableCell>
                          <TableCell>{s.locationDescription || [s.city, s.stateProvince].filter(Boolean).join(', ') || '-'}</TableCell>
                          <TableCell>${s.dailyRate || 0}/night</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {roles.includes('seeker') && (
          <TabsContent value="bookings" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No bookings made.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Retreat</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b: any) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.retreatId || '-'}</TableCell>
                          <TableCell>${b.totalAmount || 0}</TableCell>
                          <TableCell><Badge variant="secondary">{b.status || '-'}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
