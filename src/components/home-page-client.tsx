"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { SeekerIcon } from '@/components/icons/seeker-icon';
import { HostIcon } from '@/components/icons/host-icon';
import { VendorIcon } from '@/components/icons/vendor-icon';
import { SpaceOwnerIcon } from '@/components/icons/space-owner-icon';
import { placeholderImages } from '@/lib/placeholder-images';

function RoleCard({ href, icon, title, description }: RoleCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full w-full transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary hover:shadow-primary/20">
        <CardHeader className="items-center text-center p-6">
          {icon}
          <CardTitle className="font-headline text-3xl mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6 pt-0">
          <CardDescription className="font-body text-lg">{description}</CardDescription>
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
  const heroImage = placeholderImages.find((img) => img.id === 'resort-hero');

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl text-center mb-8">
        <Logo />
      </div>

      {heroImage && (
        <div className="w-full max-w-7xl mb-8">
          <div className="relative aspect-[3/1] w-full rounded-lg overflow-hidden">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              data-ai-hint={heroImage.imageHint}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl">
        <RoleCard
          href="/seeker"
          icon={<div className="h-64 flex items-center justify-center"><SeekerIcon className="w-64 h-64 text-primary" /></div>}
          title="I'm a Seeker"
          description="Discover curated retreats and immersive experiences, from wellness and leadership to creative, cultural, and transformational journeys around the globe."
        />
        <RoleCard
          href="/guide"
          icon={<div className="h-64 flex items-center justify-center"><HostIcon className="w-56 h-56 text-primary" /></div>}
          title="I'm a Guide"
          description="Design and lead meaningful retreat experiences. Connect with aligned seekers, collaborate with trusted vendors, and bring your vision to life."
        />
        <RoleCard
          href="/vendor"
          icon={<div className="h-64 flex items-center justify-center"><VendorIcon className="w-64 h-64 text-primary" /></div>}
          title="I'm a Vendor"
          description="Offer the elements that make retreats unforgettable, from private chefs and musicians to transportation, photography, wellness, and bespoke experiences."
        />
        <RoleCard
          href="/host"
          icon={<div className="h-64 flex items-center justify-center"><SpaceOwnerIcon className="w-48 h-48 text-primary" /></div>}
          title="I'm a Host"
          description="List your property as a retreat destination. Attract guides seeking beautifully designed, professionally managed spaces for retreats, gatherings, and intimate events."
        />
      </div>
    </main>
  );
}
