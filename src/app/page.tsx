import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Users, Building, Briefcase } from 'lucide-react';
import type { SVGProps } from 'react';

export default function RoleSelectionPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          RETREAT
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Find your next escape. Or create one.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-6xl">
        <RoleCard
          href="/seeker"
          icon={<Mountain className="w-10 h-10 text-primary" />}
          title="I'm a Seeker"
          description="Discover unique retreats and experiences tailored to you."
        />
        <RoleCard
          href="/host"
          icon={<Users className="w-10 h-10 text-primary" />}
          title="I'm a Host"
          description="List your retreat, connect with vendors, and manage bookings."
        />
        <RoleCard
          href="/vendor"
          icon={<Briefcase className="w-10 h-10 text-primary" />}
          title="I'm a Vendor"
          description="Offer your services to retreat hosts and grow your business."
        />
        <RoleCard
          href="/space-owner"
          icon={<Building className="w-10 h-10 text-primary" />}
          title="I'm a Space Owner"
          description="List your property for retreats and events to a global audience."
        />
      </div>
    </main>
  );
}

interface RoleCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function RoleCard({ href, icon, title, description }: RoleCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full w-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-primary">
        <CardHeader className="items-center text-center p-6">
          {icon}
          <CardTitle className="font-headline text-2xl mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6 pt-0">
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
