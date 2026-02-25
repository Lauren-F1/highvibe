
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';

type Role = 'seeker' | 'guide' | 'host' | 'vendor';

const RoleIcon = ({ roleId }: { roleId: string }) => {
  const icons: Record<string, React.ReactNode> = {
    seeker: <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    guide: <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
    vendor: <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12c0-4.42-3-8-8-8s-8 3.58-8 8c0 2.05.79 3.93 2.08 5.34L4 20h16l-2.08-2.66A7.94 7.94 0 0 0 20 12z"></path><path d="M12 12c-2.21 0-4-1.79-4-4"></path></svg>,
    host: <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  };
  return <div className="text-primary">{icons[roleId] || null}</div>;
};

const roles: { id: Role, name: string, description: string }[] = [
    {
      id: 'guide',
      name: 'Guide',
      description: 'Design and lead retreats',
    },
    {
      id: 'host',
      name: 'Host',
      description: 'List your retreat space',
    },
    {
      id: 'vendor',
      name: 'Vendor',
      description: 'Offer retreat services',
    },
     {
      id: 'seeker',
      name: 'Seeker',
      description: 'Find and book retreats',
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
                    <RoleIcon roleId={role.id} />
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
