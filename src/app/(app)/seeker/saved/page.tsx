'use client';

import { useUser } from '@/firebase';
import { RetreatCard } from '@/components/retreat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { allRetreats } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';


export default function SavedRetreatsPage() {
  const user = useUser();
  const router = useRouter();

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
  
  const savedRetreatIds = user.profile.savedRetreatIds || [];
  const savedRetreats = allRetreats.filter(r => savedRetreatIds.includes(r.id));
  const mostExpensiveRetreatId = allRetreats.reduce((prev, current) => (prev.price > current.price) ? prev : current).id;


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Saved Retreats</h1>
        <p className="text-muted-foreground mt-2 text-lg font-body">The experiences you're dreaming of.</p>
      </div>

      {savedRetreats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedRetreats.map((retreat) => (
            <RetreatCard key={retreat.id} retreat={retreat} isLux={retreat.id === mostExpensiveRetreatId} />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}
