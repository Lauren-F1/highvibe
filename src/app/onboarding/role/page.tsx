'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Role = 'seeker' | 'guide' | 'host' | 'vendor';

const roleIconMap: Record<Role, string> = {
  guide: '/Guide.svg',
  host: '/Host.svg',
  vendor: '/Vendor.svg',
  seeker: '/seeker.svg',
};

const roles: { id: Role, name: string, description: string, icon: string }[] = [
    {
      id: 'guide',
      name: 'Guide',
      description: 'Design and lead retreats',
      icon: roleIconMap.guide,
    },
    {
      id: 'host',
      name: 'Host',
      description: 'List your retreat space',
      icon: roleIconMap.host,
    },
    {
      id: 'vendor',
      name: 'Vendor',
      description: 'Offer retreat services',
      icon: roleIconMap.vendor,
    },
     {
      id: 'seeker',
      name: 'Seeker',
      description: 'Find and book retreats',
      icon: roleIconMap.seeker,
    },
]

export default function RoleOnboardingPage() {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const handleRoleSelection = async (role: Role) => {
    if (user.status !== 'authenticated' || !firestore) {
      // Should not happen, but as a safeguard
      router.push('/login');
      return;
    }

    const userRef = doc(firestore, 'users', user.data.uid);

    try {
      await updateDoc(userRef, {
        roles: arrayUnion(role),
        primaryRole: role,
        onboardingComplete: true,
      });

      // Redirect to the appropriate dashboard
      router.push(`/${role}`);
    } catch (error) {
      console.error("Error updating user role: ", error);
      // Handle error, maybe show a toast
    }
  };

  if (user.status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  if (user.status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  if (user.status === 'authenticated' && user.profile?.onboardingComplete) {
     const role = user.profile.primaryRole || 'guide';
     router.push(`/${role}`);
     return null;
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl">How are you showing up on HighVibe Retreats?</CardTitle>
          <CardDescription className="text-lg">
            Choose the role that matches why you’re here. You can add more later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => (
              <Button key={role.id} variant="outline" onClick={() => handleRoleSelection(role.id)} className="h-auto p-6 text-left">
                  <div className="flex items-center gap-4">
                    <Image src={role.icon} alt={`${role.name} icon`} width={64} height={64} className="text-primary" />
                    <div>
                      <p className="font-bold text-lg">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
