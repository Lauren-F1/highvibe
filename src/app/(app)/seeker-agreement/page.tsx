'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SeekerAgreementPage() {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (user.status !== 'authenticated' || !firestore) {
      toast({ title: 'You must be logged in to accept.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const userRef = doc(firestore, 'users', user.data.uid);
    try {
      await updateDoc(userRef, {
        seekerAgreementAccepted: true,
        seekerAgreementAcceptedAt: serverTimestamp(),
        seekerAgreementVersion: 'v1.0-02-01-2026',
      });
      toast({ title: 'Agreement Accepted!' });
      const redirectUrl = searchParams.get('redirect') || '/seeker';
      router.push(redirectUrl);
    } catch (error) {
      console.error('Failed to accept agreement:', error);
      toast({ title: 'An error occurred.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-4xl">Seeker Participation Agreement & Liability Waiver</CardTitle>
          <CardDescription>Please review and accept the terms to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>This is a placeholder for the full Seeker Participation Agreement & Liability Waiver. In a real application, this page would contain the full legal text outlining the risks of participation, release of liability, and other important terms.</p>
          <p>By clicking "Accept and Continue", you acknowledge that you have read, understood, and agreed to be bound by these terms. You agree that participation in retreats involves inherent risks for which you assume full responsibility.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAccept} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Accept and Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
