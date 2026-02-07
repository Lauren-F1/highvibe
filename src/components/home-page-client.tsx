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

function RoleCard({ href, icon, primaryLabel, title, description }: RoleCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full w-full transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary hover:shadow-primary/20">
        <CardHeader className="items-center text-center p-4">
          {icon}
          <h2 className="font-headline text-5xl text-beige mt-4">{primaryLabel}</h2>
          <CardTitle className="font-body text-2xl !mt-2 text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-4 pt-0">
          <CardDescription className="font-body text-base leading-relaxed">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

interface RoleCardProps {
  href: string;
  icon: React.ReactNode;
  primaryLabel: string;
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

      <div className="w-full max-w-4xl text-center mb-8">
        <p className="text-lg text-muted-foreground">Choose the role that best matches what you’re here to do. You can add more roles later.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl">
        <RoleCard
          href="/seeker"
          icon={<div className="h-48 flex items-center justify-center"><SeekerIcon className="w-48 h-48 text-primary" /></div>}
          primaryLabel="Seeker"
          title="I’m Seeking a Retreat"
          description="I’m looking to attend a retreat! Whether for leadership, wellness, creativity, healing, or personal growth, I want to discover meaningful experiences and be notified when retreats that match what I’m seeking become available."
        />
        <RoleCard
          href="/guide"
          icon={<div className="h-48 flex items-center justify-center"><HostIcon className="w-44 h-44 text-primary" /></div>}
          primaryLabel="Guide"
          title="I’m Hosting a Retreat"
          description="I’m creating and leading a retreat experience. I want to find the right space, connect with aligned seekers, and partner with trusted vendors to bring the full vision to life."
        />
        <RoleCard
          href="/vendor"
          icon={<div className="h-48 flex items-center justify-center"><VendorIcon className="w-48 h-48 text-primary" /></div>}
          primaryLabel="Vendor"
          title="I’m Offering Retreat Services"
          description="I offer services that make retreats unforgettable — from private chefs and photographers to wellness, music, transportation, and local experiences. I want to be discovered by guides and hosts who need what I do."
        />
        <RoleCard
          href="/host"
          icon={<div className="h-48 flex items-center justify-center"><SpaceOwnerIcon className="w-36 h-36 text-primary" /></div>}
          primaryLabel="Host"
          title="I’m Listing a Retreat Space"
          description="I have a property that can host retreats, gatherings, and immersive experiences. I want to connect with guides seeking a beautiful space that fits their retreat vision."
        />
      </div>
    </main>
  );
}
