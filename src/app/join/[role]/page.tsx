'use client';

import { AuthForm } from '@/components/auth-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';

type Role = 'guide' | 'host' | 'vendor';

const roleTitles: Record<Role, string> = {
    guide: 'Become a Guide',
    host: 'Become a Host',
    vendor: 'Become a Vendor',
};

const roleDescriptions: Record<Role, string> = {
    guide: 'Create an account to start leading retreats.',
    host: 'Create an account to list your space for retreats.',
    vendor: 'Create an account to offer your services to retreat leaders.',
};

export default function JoinPage() {
  const params = useParams();
  const role = (params.role as Role) || 'guide';

  const title = roleTitles[role];
  const description = roleDescriptions[role];

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" role={role} />
        </CardContent>
      </Card>
    </div>
  );
}
