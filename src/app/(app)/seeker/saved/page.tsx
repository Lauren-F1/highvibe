'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { isFirebaseEnabled } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { RetreatCard } from '@/components/retreat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { allRetreats } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

type Retreat = {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  type?: string[];
  duration?: string;
  included?: string;
  isFullyBooked?: boolean;
};

export default function SavedRetreatsPage() {
  const user = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [firestoreRetreats, setFirestoreRetreats] = useState<Retreat[]>([]);
  const [loadingFirestore, setLoadingFirestore] = useState(false);

  const savedRetreatIds = user.status === 'authenticated' && user.profile?.savedRetreatIds
    ? user.profile.savedRetreatIds
    : [];

  // Find retreats from mock data
  const mockRetreats = allRetreats.filter(r => savedRetreatIds.includes(r.id));
  const mockRetreatIds = new Set(mockRetreats.map(r => r.id));

  // Fetch any saved retreat IDs not found in mock data from Firestore
  useEffect(() => {
    if (!isFirebaseEnabled || savedRetreatIds.length === 0) {
      setFirestoreRetreats([]);
      return;
    }

    const missingIds = savedRetreatIds.filter((id: string) => !mockRetreatIds.has(id));
    if (missingIds.length === 0) {
      setFirestoreRetreats([]);
      return;
    }

    let cancelled = false;
    setLoadingFirestore(true);

    Promise.all(
      missingIds.map(async (id: string) => {
        try {
          const snap = await getDoc(doc(firestore, 'retreats', id));
          if (snap.exists()) {
            const data = snap.data();
            return {
              id: snap.id,
              title: data.title || 'Untitled Retreat',
              description: data.description || '',
              location: data.location || '',
              price: data.price || 0,
              rating: data.rating || 0,
              image: data.image || '',
              type: data.type,
              duration: data.duration,
              included: data.included,
              isFullyBooked: data.isFullyBooked,
            } as Retreat;
          }
          return null;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (!cancelled) {
        setFirestoreRetreats(results.filter((r): r is Retreat => r !== null));
        setLoadingFirestore(false);
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedRetreatIds.join(',')]);

  if (user.status === 'loading') {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (user.status === 'unauthenticated' || !user.profile) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md text-center p-8">
            <CardHeader>
                <CardTitle className="font-headline text-2xl mb-2">Log In to View Saved Retreats</CardTitle>
                <CardDescription>
                Create an account or log in to keep track of the experiences that inspire you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.push('/login?redirect=/seeker/saved')}>Log In or Sign Up</Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  const savedRetreats = [...mockRetreats, ...firestoreRetreats];
  const allAvailable = [...allRetreats, ...firestoreRetreats];
  const mostExpensiveRetreatId = allAvailable.length > 0
    ? allAvailable.reduce((prev, current) => (prev.price > current.price) ? prev : current).id
    : '';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Saved Retreats</h1>
        <p className="text-muted-foreground mt-2 text-lg font-body">The experiences you're dreaming of.</p>
      </div>

      {loadingFirestore && (
        <p className="text-muted-foreground text-sm mb-4">Loading saved retreats...</p>
      )}

      {savedRetreats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedRetreats.map((retreat) => (
            <RetreatCard key={retreat.id} retreat={retreat} isLux={retreat.id === mostExpensiveRetreatId} />
          ))}
        </div>
      ) : !loadingFirestore ? (
        <Card className="text-center py-16">
          <CardHeader>
            <CardTitle className="font-headline text-2xl mb-2">You haven't saved any retreats yet.</CardTitle>
            <CardDescription>
              Start exploring to find experiences that call to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/seeker">Explore Retreats</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
