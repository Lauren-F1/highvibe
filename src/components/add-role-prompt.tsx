'use client';

import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, setDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isFirebaseEnabled } from '@/firebase/config';
import { Loader2 } from 'lucide-react';

type Role = 'guide' | 'host' | 'vendor';

const roleDescriptions: Record<Role, { title: string; cta: string; description: string }> = {
  guide: {
    title: 'Start Leading Retreats',
    cta: 'Become a Guide',
    description: 'Create and lead meaningful retreat experiences. Connect with hosts and vendors to bring your vision to life.',
  },
  host: {
    title: 'List Your Space',
    cta: 'Become a Host',
    description: 'Share your property with retreat guides. Set your availability and connect with guides looking for the perfect space.',
  },
  vendor: {
    title: 'Offer Your Services',
    cta: 'Become a Vendor',
    description: 'Provide services like catering, photography, yoga instruction, and more to retreats in your area.',
  },
};

export function AddRolePrompt({ role }: { role: Role }) {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const info = roleDescriptions[role];

  const handleAddRole = async () => {
    setLoading(true);

    if (user.status !== 'authenticated') {
      toast({
        variant: 'destructive',
        title: 'Please log in first',
        description: 'You need to be signed in to continue.',
      });
      setLoading(false);
      return;
    }

    if (isFirebaseEnabled) {
      if (!firestore) {
        toast({
          variant: 'destructive',
          title: 'Connection Error',
          description: 'Cannot connect to the database. Please try again later.',
        });
        setLoading(false);
        return;
      }

      const userRef = doc(firestore, 'users', user.data.uid);
      try {
        // Check if the user doc exists and has the id field
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const updates: Record<string, unknown> = {
            roles: arrayUnion(role),
          };

          // Ensure id field exists (older accounts may be missing it)
          if (!data.id) {
            updates.id = user.data.uid;
          }

          if (!data.primaryRole) {
            updates.primaryRole = role;
          }

          await updateDoc(userRef, updates);
        } else {
          // User doc doesn't exist — create it
          await setDoc(userRef, {
            id: user.data.uid,
            uid: user.data.uid,
            email: user.data.email?.toLowerCase() || '',
            displayName: user.data.displayName || '',
            roles: [role],
            primaryRole: role,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
        }

        toast({
          title: 'Welcome!',
          description: `You're all set as a ${role}. Let's get started.`,
        });
        router.push(`/${role}`);
        router.refresh();
      } catch (error: any) {
        console.error('Error adding role:', error);
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: 'Could not update your account. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      // --- Dev Auth Mode ---
      try {
        const devProfileStr = localStorage.getItem('devProfile');
        if (!devProfileStr) {
          throw new Error('Dev profile not found in localStorage.');
        }
        const profile = JSON.parse(devProfileStr);

        const updatedRoles = [...(profile.roles || [])];
        if (!updatedRoles.includes(role)) {
          updatedRoles.push(role);
        }

        const updatedProfile = {
          ...profile,
          roles: updatedRoles,
          primaryRole: profile.primaryRole || role,
        };

        localStorage.setItem('devProfile', JSON.stringify(updatedProfile));

        toast({
          title: 'Welcome!',
          description: `You're all set as a ${role}.`,
        });

        router.push(`/${role}`);
        router.refresh();
      } catch (error: any) {
        console.error('Error updating dev profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not update your profile.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{info.title}</CardTitle>
          <CardDescription className="mt-2 text-base">
            {info.description}
          </CardDescription>
          <CardDescription className="mt-1 text-sm">
            You can always add more roles later from your account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleAddRole} size="lg" disabled={loading} className="w-full max-w-xs">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</> : info.cta}
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="w-full max-w-xs">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
