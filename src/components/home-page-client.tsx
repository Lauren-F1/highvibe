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
      <Card className="h-full w-full transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/75">
        <CardHeader className="items-center text-center p-4">
          <div className="h-32 flex items-center justify-center">
            {icon}
          </div>
          <CardTitle className="font-headline text-4xl text-beige tracking-wider !mt-4">{primaryLabel}</CardTitle>
          <h3 className="font-body text-xl !mt-2 text-foreground">{title}</h3>
        </CardHeader>
        <CardContent className="text-center px-4 pb-4 pt-0">
          <CardDescription className="font-body text-sm leading-relaxed text-muted-foreground">{description}</CardDescription>
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

      <div className="w-full max-w-4xl text-center mb-12">
        <h2 className="font-headline text-3xl md:text-4xl">Every journey begins with participation.</h2>
        <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Choose the role most aligned with what brought you here. You can add more ways to participate as your path unfolds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl">
        <RoleCard
          href="/seeker"
          icon={<SeekerIcon className="w-36 h-36 text-primary" />}
          primaryLabel="Seeker"
          title="I’m Seeking a Retreat"
          description="I’m looking to attend a retreat! Whether for leadership, wellness, creativity, healing, or personal growth, I want to discover meaningful experiences and be notified when retreats that match what I’m seeking become available."
        />
        <RoleCard
          href="/guide"
          icon={<HostIcon className="w-36 h-36 text-primary" />}
          primaryLabel="Guide"
          title="I’m Hosting a Retreat"
          description="I’m creating and leading a retreat experience. I want to find the right space, connect with aligned seekers, and partner with trusted vendors to bring the full vision to life."
        />
        <RoleCard
          href="/vendor"
          icon={<VendorIcon className="w-36 h-36 text-primary" />}
          primaryLabel="Vendor"
          title="I’m Offering Retreat Services"
          description="I offer services that make retreats unforgettable — from private chefs and photographers to wellness, music, transportation, and local experiences. I want to be discovered by guides and hosts who need what I do."
        />
        <RoleCard
          href="/host"
          icon={<SpaceOwnerIcon className="w-28 h-28 text-primary" />}
          primaryLabel="Host"
          title="I’m Listing a Retreat Space"
          description="I have a property that can host retreats, gatherings, and immersive experiences. I want to connect with guides seeking a beautiful space that fits their retreat vision."
        />
      </div>
    </main>
  );
}
