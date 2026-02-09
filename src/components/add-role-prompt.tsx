'use client';

import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type Role = 'guide' | 'host' | 'vendor';

export function AddRolePrompt({ role }: { role: Role }) {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAddRole = async () => {
    if (user.status !== 'authenticated' || !firestore) return;

    setLoading(true);
    const userRef = doc(firestore, 'users', user.data.uid);
    try {
      await updateDoc(userRef, {
        roles: arrayUnion(role),
        // Only set primary role if it's not already set
        ...(!user.profile?.primaryRole && { primaryRole: role }),
      });
      toast({
        title: "Role Added!",
        description: `You can now access the ${role} dashboard.`,
      });
      router.push(`/${role}`);
    } catch (error) {
      console.error("Error adding role: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add the role. Please try again.',
      });
    } finally {
      setLoading(false);
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
