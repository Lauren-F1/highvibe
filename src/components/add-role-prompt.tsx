'use client';

import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isFirebaseEnabled } from '@/firebase/config';

type Role = 'guide' | 'host' | 'vendor';

export function AddRolePrompt({ role }: { role: Role }) {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAddRole = async () => {
    console.log(`'Add ${role} Role' button clicked.`);
    setLoading(true);

    if (user.status !== 'authenticated') {
      console.error('User not authenticated.');
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to add a role.',
      });
      setLoading(false);
      return;
    }

    console.log('User is authenticated:', { uid: user.data.uid, email: user.data.email });

    if (isFirebaseEnabled) {
      // --- Firebase Mode ---
      if (!firestore) {
        console.error('Firestore is not initialized.');
        toast({
          variant: 'destructive',
          title: 'Configuration Error',
          description: 'Cannot connect to the database. Please try again later.',
        });
        setLoading(false);
        return;
      }
      console.log('Calling Firestore updateDoc...');
      const userRef = doc(firestore, 'users', user.data.uid);
      try {
        await updateDoc(userRef, {
          roles: arrayUnion(role),
          ...(!user.profile?.primaryRole && { primaryRole: role }),
        });
        console.log('Firestore update successful.');
        toast({
          title: 'Role Added!',
          description: `You can now access the ${role} dashboard.`,
        });
        router.push(`/${role}`);
        router.refresh();
      } catch (error: any) {
        console.error('Error adding role to Firestore: ', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Could not add the role. Error: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    } else {
      // --- Dev Auth Mode ---
      console.log('Running in Dev Auth Mode.');
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
        console.log('Dev profile updated in localStorage:', updatedProfile);

        toast({
          title: 'Role Added! (Dev Mode)',
          description: `You can now access the ${role} dashboard.`,
        });

        router.push(`/${role}`);
        router.refresh();
      } catch (error: any) {
        console.error('Error updating dev profile in localStorage:', error);
        toast({
          variant: 'destructive',
          title: 'Dev Mode Error',
          description: `Could not add role locally. Error: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Add the "{roleName}" Role to Continue</CardTitle>
          <CardDescription className="mt-2 text-base">You can participate in more than one way on HighVibe Retreats.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleAddRole} size="lg" disabled={loading} className="w-full max-w-xs">
            {loading ? 'Adding Role...' : `Add ${roleName} Role`}
          </Button>
          <Button variant="outline" onClick={() => router.push('/onboarding/role')} className="w-full max-w-xs">
            Choose a Different Role
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
