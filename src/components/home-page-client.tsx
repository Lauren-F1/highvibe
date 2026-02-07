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
        <CardHeader className="items-center text-center p-6">
          <CardTitle className="font-headline text-4xl text-beige tracking-wider">{primaryLabel}</CardTitle>
          <div className="flex items-center justify-center my-4">
            {icon}
          </div>
          <h3 className="font-body text-base !mt-0 text-foreground">{title}</h3>
        </CardHeader>
        <CardContent className="text-center px-6 pb-6 pt-0">
          <CardDescription className="font-body text-xs leading-relaxed text-muted-foreground">{description}</CardDescription>
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
        <p className="text-lg text-beige-dark mt-2 max-w-3xl mx-auto">Choose the role most aligned with what brought you here. You can add more ways to participate as your path unfolds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl">
        <RoleCard
          href="/seeker"
          icon={<SeekerIcon className="w-24 h-24 text-primary" />}
          primaryLabel="Seeker"
          title="I’m Seeking a Retreat"
          description="Discover retreats aligned with leadership, wellness, creativity, healing, and personal growth. Get notified when experiences that match what you’re seeking become available."
        />
        <RoleCard
          href="/guide"
          icon={<HostIcon className="w-24 h-24 text-primary" />}
          primaryLabel="Guide"
          title="I’m Hosting a Retreat"
          description="Design and lead meaningful retreats. Find the right space, connect with aligned seekers, and partner with trusted vendors to bring your vision to life."
        />
        <RoleCard
          href="/vendor"
          icon={<VendorIcon className="w-24 h-24 text-primary" />}
          primaryLabel="Vendor"
          title="I’m Offering Retreat Services"
          description="Offer services that elevate retreats — from wellness and music to food, transport, and local experiences. Be discovered by guides and hosts who need what you provide."
        />
        <RoleCard
          href="/host"
          icon={<SpaceOwnerIcon className="w-20 h-20 text-primary" />}
          primaryLabel="Host"
          title="I’m Listing a Retreat Space"
          description="List a property designed for retreats and gatherings. Connect with guides seeking beautiful, well-suited spaces for immersive experiences."
        />
      </div>
    </main>
  );
}
