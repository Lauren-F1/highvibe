'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Booking Confirmed!</CardTitle>
          <CardDescription className="text-base mt-2">
            Your payment was successful and your retreat booking has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You will receive a confirmation email shortly with all the details.
            You can view your bookings and manifestations from your dashboard.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/seeker/manifestations">View My Bookings</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/seeker">Browse More Retreats</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Loading confirmation...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
