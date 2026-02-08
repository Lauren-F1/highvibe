import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SeekerIcon } from '@/components/icons/seeker-icon';
import { HostIcon } from '@/components/icons/host-icon';
import { VendorIcon } from '@/components/icons/vendor-icon';
import { SpaceOwnerIcon } from '@/components/icons/space-owner-icon';

const roles = [
    {
      name: 'Guide',
      description: 'Design and lead retreats',
      href: '/join/guide',
      icon: <HostIcon className="w-12 h-12 text-primary" />
    },
    {
      name: 'Host',
      description: 'List your retreat space',
      href: '/join/host',
      icon: <SpaceOwnerIcon className="w-12 h-12 text-primary" />
    },
    {
      name: 'Vendor',
      description: 'Offer retreat services',
      href: '/join/vendor',
      icon: <VendorIcon className="w-12 h-12 text-primary" />
    },
     {
      name: 'Seeker',
      description: 'Find and book retreats',
      href: '/join/seeker',
      icon: <SeekerIcon className="w-14 h-14 text-primary" />
    },
]

export default function JoinPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl">Join RETREAT</CardTitle>
          <CardDescription>
            Choose the role that best describes how you want to participate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => (
              <Button key={role.name} variant="outline" asChild className="h-auto p-6 text-left">
                <Link href={role.href}>
                  <div className="flex items-center gap-4">
                    {role.icon}
                    <div>
                      <p className="font-bold text-lg">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </Link>
              </Button>
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
