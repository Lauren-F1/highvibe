'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Role = 'seeker' | 'guide' | 'host' | 'vendor';

const ROLE_ICON_SRC: Record<Role, string> = {
  guide: '/guide.svg',
  host: '/host.svg',
  vendor: '/vendor.svg',
  seeker: '/seeker.svg',
};

const roles: { id: Role, name: string, description: string, icon: string }[] = [
    {
      id: 'guide',
      name: 'Guide',
      description: 'Design and lead retreats',
      icon: ROLE_ICON_SRC.guide,
    },
    {
      id: 'host',
      name: 'Host',
      description: 'List your retreat space',
      icon: ROLE_ICON_SRC.host,
    },
    {
      id: 'vendor',
      name: 'Vendor',
      description: 'Offer retreat services',
      icon: ROLE_ICON_SRC.vendor,
    },
     {
      id: 'seeker',
      name: 'Seeker',
      description: 'Find and book retreats',
      icon: ROLE_ICON_SRC.seeker,
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
              <div 
                key={role.id} 
                onClick={() => handleRoleSelection(role.id)} 
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRoleSelection(role.id) }}
                tabIndex={0}
                className="group block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Card className={cn(
                  "h-full cursor-pointer transition-shadow duration-300 ease-in-out border-primary",
                  "hover:shadow-2xl hover:shadow-primary/40"
                )}>
                  <CardContent className="flex items-center gap-4 p-6 text-left">
                    <Image src={role.icon} alt={`${role.name} icon`} width={96} height={96} />
                    <div>
                      <p className="font-bold text-lg">{role.name}</p>
                      <p className="font-body text-sm text-beige-dark">{role.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
