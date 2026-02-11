'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type Manifestation = {
  id: string;
  status: 'draft' | 'submitted' | 'matching' | 'proposals_open' | 'assembling' | 'booked' | 'completed' | 'closed';
  destination: { country: string; region?: string };
  date_pref: { type: string; start_date?: any; end_date?: any; month?: string; season?: string };
  created_at: any;
};

const statusGroups = {
  drafts: ['draft'],
  active: ['submitted', 'matching', 'proposals_open', 'assembling'],
  completed: ['booked', 'completed', 'closed'],
};

function ManifestationList({ manifestations }: { manifestations: Manifestation[] }) {
    if (manifestations.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No manifestations in this category.</p>
    }

    return (
        <div className="space-y-4">
            {manifestations.map(m => (
                <Card key={m.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold">{m.destination.country}{m.destination.region && `, ${m.destination.region}`}</p>
                            <p className="text-sm text-muted-foreground">
                                {m.date_pref.type === 'exact' 
                                    ? `${m.date_pref.start_date ? format(m.date_pref.start_date.toDate(), 'PP') : ''} - ${m.date_pref.end_date ? format(m.date_pref.end_date.toDate(), 'PP'): ''}`
                                    : `${m.date_pref.month || ''} ${m.date_pref.season || ''}`
                                }
                            </p>
                        </div>
                        <div className="text-right">
                            <Badge variant="secondary" className="capitalize mb-2">{m.status}</Badge>
                            <Button asChild><Link href={`/seeker/manifestations/${m.id}`}>View</Link></Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function MyManifestationsPage() {
  const user = useUser();
  const firestore = useFirestore();
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.status !== 'authenticated' || !firestore) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(firestore, 'manifestations'),
      where('seeker_id', '==', user.data.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manifestation));
      setManifestations(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching manifestations:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.status, firestore, user.data?.uid]);
  
  const drafts = manifestations.filter(m => statusGroups.drafts.includes(m.status));
  const active = manifestations.filter(m => statusGroups.active.includes(m.status));
  const completed = manifestations.filter(m => statusGroups.completed.includes(m.status));

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline text-4xl">My Manifestations</h1>
          <p className="text-muted-foreground mt-2">Track your dream retreat requests.</p>
        </div>
        <Button asChild><Link href="/seeker/manifest/new">Create New</Link></Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
            {loading ? <p>Loading...</p> : <ManifestationList manifestations={active} />}
        </TabsContent>
        <TabsContent value="drafts" className="mt-6">
            {loading ? <p>Loading...</p> : <ManifestationList manifestations={drafts} />}
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
            {loading ? <p>Loading...</p> : <ManifestationList manifestations={completed} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
