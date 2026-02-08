'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join the RETREAT community.</CardDescription>
        </CardHeader>
        <CardContent>
            <AuthForm mode="signup" />
        </CardContent>
      </Card>
    </div>
  );
}
