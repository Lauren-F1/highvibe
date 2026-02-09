import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Do not change icon assets or casing; icons must always load from /public and remain unmodified.
const roleIconMap: Record<string, string> = {
  Guide: '/Guide.svg',
  Host: '/Host.svg',
  Vendor: '/Vendor.svg',
  Seeker: '/seeker.svg',
};

const roles = [
    {
      name: 'Guide',
      description: 'Design and lead retreats',
      href: '/join/guide',
      icon: roleIconMap['Guide']
    },
    {
      name: 'Host',
      description: 'List your retreat space',
      href: '/join/host',
      icon: roleIconMap['Host']
    },
    {
      name: 'Vendor',
      description: 'Offer retreat services',
      href: '/join/vendor',
      icon: roleIconMap['Vendor']
    },
     {
      name: 'Seeker',
      description: 'Find and book retreats',
      href: '/join/seeker',
      icon: roleIconMap['Seeker']
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
                  "group-hover:shadow-xl group-hover:shadow-primary/40"
                )}>
                  <CardContent className="flex items-center gap-4 p-6 text-left">
                    <Image src={role.icon} alt={`${role.name} icon`} width={64} height={64} />
                    <div>
                      <p className="font-bold text-lg">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
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
