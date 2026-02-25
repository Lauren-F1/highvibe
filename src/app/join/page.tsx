
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

const RoleIcon = ({ roleId }: { roleId: string }) => {
  const icons: Record<string, React.ReactNode> = {
    seeker: <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    guide: <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
    vendor: <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12c0-4.42-3-8-8-8s-8 3.58-8 8c0 2.05.79 3.93 2.08 5.34L4 20h16l-2.08-2.66A7.94 7.94 0 0 0 20 12z"></path><path d="M12 12c-2.21 0-4-1.79-4-4"></path></svg>,
    host: <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  };
  return <div className="text-primary">{icons[roleId] || null}</div>;
};

const roles = [
    {
      id: 'guide',
      name: 'Guide',
      description: 'Design and lead retreats',
      href: '/join/guide',
    },
    {
      id: 'host',
      name: 'Host',
      description: 'List your retreat space',
      href: '/join/host',
    },
    {
      id: 'vendor',
      name: 'Vendor',
      description: 'Offer retreat services',
      href: '/join/vendor',
    },
     {
      id: 'seeker',
      name: 'Seeker',
      description: 'Find and book retreats',
      href: '/join/seeker',
    },
]

export default function JoinPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl">Join HighVibe Retreats</CardTitle>
          <CardDescription>
            Choose the role that best describes how you want to participate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => (
              <Link key={role.name} href={role.href} className="group block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
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
              </Link>
            ))}
          </div>
           <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
