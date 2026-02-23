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
        <CardContent className="space-y-6 text-sm font-body text-foreground/80">
            <p className="font-medium">Effective Date: February 1, 2026</p>
            <p>This Seeker Participation Agreement & Liability Waiver (“Agreement”) governs your participation in any retreat or service booked through HighVibe Retreats (“HighVibe”).</p>
            <p className="font-bold">By booking a retreat or service, you agree to be legally bound by this Agreement.</p>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">1. Platform Role</h2>
                <p>HighVibe is a technology marketplace that connects you with independent Guides, Hosts, and Vendors. HighVibe does not organize, operate, or control retreats. Your contract for any retreat is with the Provider, not HighVibe.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">2. Employer or Corporate Participation</h2>
                <p>If your participation is sponsored, reimbursed, or encouraged by an employer or organization, HighVibe does not assume any employer-related duty of care, supervision, or compliance obligations.</p>
                <p>HighVibe does not provide workplace training, professional development services, or corporate event management.</p>
                <p>Participation remains voluntary and at your own risk.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">3. Assumption of Risk</h2>
                <p>You understand and acknowledge that participation in retreats involves inherent risks, including but not limited to physical activity, travel, exposure to outdoor elements, and interaction with third parties. You voluntarily assume all risks associated with your participation.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">4. Release of Liability</h2>
                <p>To the fullest extent permitted by law, you release HighVibe from all claims, liabilities, and damages arising out of or in connection with your participation in any retreat, including claims of negligence, personal injury, property damage, or death.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">5. Medical Acknowledgment</h2>
                <p>You confirm that you are physically and mentally fit to participate. You are responsible for consulting with a medical professional regarding your suitability for any retreat activities.</p>
            </div>

            <p className="font-bold pt-4">By clicking "Accept and Continue", you acknowledge that you have read, understood, and agreed to be bound by these terms.</p>
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
