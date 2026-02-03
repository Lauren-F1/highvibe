"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { SeekerIcon } from '@/components/icons/seeker-icon';
import { HostIcon } from '@/components/icons/host-icon';
import { VendorIcon } from '@/components/icons/vendor-icon';
import { SpaceOwnerIcon } from '@/components/icons/space-owner-icon';

function RoleCard({ href, icon, title, description }: RoleCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full w-full transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary">
        <CardHeader className="items-center text-center p-6">
          {icon}
          <CardTitle className="font-headline text-3xl mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6 pt-0">
          <CardDescription className="text-lg">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

interface RoleCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function HomePageClient() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 pt-12 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl text-center mb-8">
        <Logo />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-6xl">
        <RoleCard
          href="/seeker"
          icon={<SeekerIcon className="w-32 h-32 text-primary" />}
          title="I'm a Seeker"
          description="Discover curated retreats and immersive experiences, from wellness and leadership to creative, cultural, and transformational journeys around the globe."
        />
        <RoleCard
          href="/guide"
          icon={<HostIcon className="w-32 h-32 text-primary" />}
          title="I'm a Guide"
          description="Design and lead meaningful retreat experiences. Connect with aligned seekers, collaborate with trusted vendors, and bring your vision to life."
        />
        <RoleCard
          href="/vendor"
          icon={<VendorIcon className="w-32 h-32 text-primary" />}
          title="I'm a Vendor"
          description="Offer the elements that make retreats unforgettable, from private chefs and musicians to transportation, photography, wellness, and bespoke experiences."
        />
        <RoleCard
          href="/host"
          icon={<SpaceOwnerIcon className="w-32 h-32 text-primary" />}
          title="I'm a Host"
          description="List your property as a retreat destination. Attract guides seeking beautifully designed, professionally managed spaces for retreats, gatherings, and intimate events."
        />
      </div>
    </main>
  );
}
