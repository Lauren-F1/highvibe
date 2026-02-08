'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

const roleDisplayNames: Record<string, string> = {
    guide: 'Guide',
    host: 'Host',
    vendor: 'Vendor',
    seeker: 'Seeker'
};

export default function JoinRolePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const role = Array.isArray(params.role) ? params.role[0] : params.role;
  const displayName = roleDisplayNames[role] || 'Member';

  useEffect(() => {
    if (user.status === 'authenticated') {
        const redirect = searchParams.get('redirect');
        if (redirect) {
            router.push(redirect);
        } else {
            router.push(`/${role}`);
        }
    }
  }, [user, router, role, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create your {displayName} Account</CardTitle>
          <CardDescription>Welcome! Let's get you set up on RETREAT.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" role={role as 'guide' | 'host' | 'vendor' | 'seeker'}/>
        </CardContent>
      </Card>
    </div>
  );
}
