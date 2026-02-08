'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const user = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (user.status === 'authenticated') {
            const redirect = searchParams.get('redirect');
            if (redirect) {
                router.push(redirect);
                return;
            }

            const primaryRole = user.profile?.primaryRole;
            if (primaryRole) {
                router.push(`/${primaryRole}`);
            } else if (user.profile && !user.profile.onboardingComplete) {
                router.push('/onboarding/role');
            } else {
                router.push('/'); // Fallback to home
            }
        }
    }, [user, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome back.</CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
            <AuthForm mode="login" />
        </CardContent>
      </Card>
    </div>
  );
}
