'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminUserDetailPage() {
  const params = useParams();
  const uid = params.uid as string;
  const currentUser = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser.status !== 'authenticated') return;

    const fetchUser = async () => {
      try {
        const token = await currentUser.data?.getIdToken();
        const res = await fetch(`/api/admin/users/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch');
        setData(await res.json());
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [currentUser.status, uid]);

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
  const roles = user.roles || [];

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
                {user.location && <div><span className="text-muted-foreground">Location:</span> {user.location}</div>}
                {user.bio && <div className="col-span-2"><span className="text-muted-foreground">Bio:</span> {user.bio}</div>}
              </div>
            </div>
          </div>
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
