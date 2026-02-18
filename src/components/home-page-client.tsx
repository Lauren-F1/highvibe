
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { placeholderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';
import { WaitlistForm } from './waitlist-form';
import { useToast } from '@/hooks/use-toast';

// Do not change icon assets or casing; icons must always load from /public and remain unmodified.
const ROLE_ICON_SRC: Record<string, string> = {
  seeker: '/Seeker.svg',
  guide: '/Guide.svg',
  vendor: '/Vendor.svg',
  host: '/Host.svg',
};

interface Role {
  id: 'seeker' | 'guide' | 'vendor' | 'host';
  href: string;
  icon: string;
  primaryLabel: string;
  title: string;
  description: string;
}

const roles: Role[] = [
    {
      id: 'seeker',
      href: "/seeker",
      icon: ROLE_ICON_SRC.seeker,
      primaryLabel: "Seeker",
      title: "I’m Seeking a Retreat",
      description: "Discover retreats aligned with leadership, wellness, creativity, healing, and personal growth. Get notified when experiences that match what you’re seeking become available."
    },
    {
      id: 'guide',
      href: "/guide",
      icon: ROLE_ICON_SRC.guide,
      primaryLabel: "Guide",
      title: "I’m Leading a Retreat",
      description: "Design and lead meaningful retreat experiences. Find the right space, connect with aligned seekers, and collaborate with trusted vendors to bring your vision to life."
    },
    {
      id: 'vendor',
      href: "/vendor",
      icon: ROLE_ICON_SRC.vendor,
      primaryLabel: "Vendor",
      title: "I’m Offering Retreat Services",
      "description": "Offer services that make retreats unforgettable — from wellness and music to food, transportation, and curated local experiences. Connect with guides and hosts looking to elevate their retreats."
    },
    {
      id: 'host',
      href: "/host",
      icon: ROLE_ICON_SRC.host,
      primaryLabel: "Host",
      title: "I’m Listing a Retreat Space",
      description: "List a property designed for retreats, gatherings, and immersive experiences. Connect with guides seeking beautiful, well-suited spaces for meaningful retreat experiences."
    },
];


export default function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const heroImage = placeholderImages.find((img) => img.id === 'resort-hero');
  
  useEffect(() => {
    if (searchParams.get('reason') === 'prelaunch') {
        toast({
            title: 'We’re in prelaunch.',
            description: "Join the waitlist to get early access.",
            duration: 5000,
        });
        // Optional: remove the query param from URL without reloading
        router.replace('/', { scroll: false });
    }
  }, [searchParams, toast, router]);

  const handleRoleClick = (href: string) => {
    router.push(href);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, href: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRoleClick(href);
    }
  };
  
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
        <h2 className="font-headline text-3xl md:text-4xl">Choose your role. Find your people.</h2>
        <p className="text-lg text-beige-dark mt-2 max-w-3xl mx-auto font-body">Book experiences or create them. HighVibe connects retreat leaders with aligned spaces and trusted vendors, all in one platform.</p>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl mb-8"
      >
        {roles.map((role) => {
          return (
            <div
              key={role.id}
              tabIndex={0}
              onClick={() => handleRoleClick(role.href)}
              onKeyDown={(e) => handleKeyDown(e, role.href)}
              className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
            >
              <Card className={cn(
                  "h-full w-full transition-shadow duration-300 ease-in-out p-6 border-primary",
                  "group-hover:shadow-xl group-hover:shadow-primary/40"
              )}>
                <CardHeader className="items-center text-center p-0">
                  <CardTitle className="font-headline text-5xl text-beige tracking-wider mb-3">{role.primaryLabel}</CardTitle>
                  <div className="flex items-center justify-center mb-3 h-24 w-24">
                     <Image src={role.icon} alt={`${role.primaryLabel} icon`} width={96} height={96} />
                  </div>
                  <h3 className="font-body text-2xl text-foreground font-semibold">{role.title}</h3>
                </CardHeader>
                <CardContent className="text-center px-2 pb-2 pt-4">
                  <CardDescription className="font-body text-sm leading-snug text-beige-dark">{role.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
      <div className="w-full max-w-4xl text-center my-16">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl md:text-4xl">Be First In</CardTitle>
                <CardDescription className="text-lg text-beige-dark mt-2 max-w-3xl mx-auto font-body">
                    HighVibe Retreats is launching soon. Join the waitlist for early access and founder-level perks.
                </CardDescription>
                <p className="text-base text-foreground mt-4 max-w-3xl mx-auto font-body font-semibold">
                    Founder Perk: first 250 verified sign-ups get 60 days of membership fees waived.
                </p>
            </CardHeader>
            <CardContent>
                <WaitlistForm source="landing" />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
