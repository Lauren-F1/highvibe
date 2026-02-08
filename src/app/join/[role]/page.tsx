'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function JoinPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Sign Up Coming Soon</CardTitle>
          <CardDescription>User sign-up will be enabled here.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <Button asChild>
                <Link href="/">Return to Homepage</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
