'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WaitlistModal } from './waitlist-modal';
import { Button } from './ui/button';
import * as analytics from '@/lib/analytics';
import { HOMEPAGE_PERK_TEASER } from '@/lib/waitlist-constants';

const ROLE_ICON_SRC: Record<string, string> = {
  seeker: '/seeker.svg',
  guide: '/guide.svg',
  vendor: '/vendor.svg',
  host: '/host.svg',
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
      title: "I'm Seeking a Retreat",
      description: "Discover retreats aligned with leadership, wellness, creativity, healing, and personal growth. Get notified when experiences that match what you're seeking become available."
    },
    {
      id: 'guide',
      href: "/guide",
      icon: ROLE_ICON_SRC.guide,
      primaryLabel: "Guide",
      title: "I'm Leading a Retreat",
      description: "Design and lead meaningful retreat experiences. Find the right space, connect with aligned seekers, and collaborate with trusted vendors to bring your vision to life."
    },
    {
      id: 'vendor',
      href: "/vendor",
      icon: ROLE_ICON_SRC.vendor,
      primaryLabel: "Vendor",
      title: "I'm Offering Retreat Services",
      description: "Offer services that make retreats unforgettable — from wellness and music to food, transportation, and curated local experiences. Connect with guides and hosts looking to elevate their retreats."
    },
    {
      id: 'host',
      href: "/host",
      icon: ROLE_ICON_SRC.host,
      primaryLabel: "Host",
      title: "I'm Listing a Retreat Space",
      description: "List a property designed for retreats, gatherings, and immersive experiences. Connect with guides seeking beautiful, well-suited spaces for meaningful retreat experiences."
    },
];


export default function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const heroImageSrc = '/resort-image.png';

  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [defaultRole, setDefaultRole] = useState<"Seeker" | "Guide" | "Host" | "Vendor" | "">("");
  const [modalSource, setModalSource] = useState("homepage-role-card");

  const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true';

  useEffect(() => {
    analytics.event('landing_view', { category: 'engagement' });

    const reason = searchParams.get('reason');
    if (reason) {
        if (reason === 'prelaunch') {
            toast({
                title: 'We\u2019re in prelaunch.',
                description: "Join the waitlist to get early access.",
                duration: 5000,
            });
        } else if (reason === 'prelaunch_non_admin' || reason === 'prelaunch_non_invited' || reason === 'prelaunch_not_on_waitlist') {
             toast({
                title: 'Prelaunch Access Is Limited',
                description: "We\u2019re currently in a prelaunch phase. Join the waitlist to be notified when we open up.",
                duration: 5000,
            });
        }
        // Remove the query param from URL without reloading
        router.replace('/', { scroll: false });
    }
  }, [searchParams, toast, router]);

  const handleRoleClick = (role: Role) => {
    if (isLaunchMode) {
        setDefaultRole(role.primaryLabel as any);
        setModalSource("homepage-role-card");
        setIsWaitlistModalOpen(true);
    } else {
        router.push(role.href);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, role: Role) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRoleClick(role);
    }
  };

  return (
    <>
    <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onOpenChange={setIsWaitlistModalOpen}
        source={modalSource}
        defaultRole={defaultRole}
    />
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl text-center mb-4">
        <Logo />
      </div>

      <div className="w-full max-w-7xl mb-8">
        <div className="p-3 md:p-5" style={{ borderRadius: 0, background: 'linear-gradient(180deg, rgba(198,184,164,0.14) 0%, rgba(198,184,164,0.30) 100%)' }}>
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={heroImageSrc}
              alt="Beautiful resort view"
              fill
              className="object-cover"
              priority
              style={{ objectPosition: 'center 60%', borderRadius: 0 }}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl text-center mb-12">
        <h2 className="font-headline text-3xl md:text-4xl">Choose your role. Find your people.</h2>
        <p className="text-lg text-beige-dark mt-2 max-w-3xl mx-auto font-body">Book experiences or create them. HighVibe connects retreat leaders with aligned spaces and trusted vendors, all in one platform.</p>
      </div>

      <div className="w-full max-w-5xl my-8">
        <div className="rounded-xl border border-beige bg-beige/10 p-6 shadow-sm md:p-10">
          <h3 className="font-headline text-3xl mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-3">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground mb-4">1</div>
              <h4 className="font-headline text-xl mb-2">Choose what you&apos;re here for.</h4>
              <p className="text-sm font-body text-muted-foreground">Whether you&apos;re looking for a retreat or building one, select your role so HighVibe can match you with the right opportunities.</p>
            </div>
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground mb-4">2</div>
              <h4 className="font-headline text-xl mb-2">Find what fits, and be found.</h4>
              <p className="text-sm font-body text-muted-foreground">Discover retreats aligned with what you&apos;re looking for, or create a profile that helps the right attendees and collaborators find you.</p>
            </div>
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground mb-4">3</div>
              <h4 className="font-headline text-xl mb-2">Build better retreats together.</h4>
              <p className="text-sm font-body text-muted-foreground">Connect with retreat leaders, spaces, and vendors to collaborate, curate, and bring meaningful experiences to life.</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl mt-8 mb-8"
        id="join"
      >
        {roles.map((role) => {
          return (
            <div
              key={role.id}
              tabIndex={0}
              onClick={() => handleRoleClick(role)}
              onKeyDown={(e) => handleKeyDown(e, role)}
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
      <div
        className="w-full py-10 md:py-14 my-8 -mx-4 sm:-mx-6 md:-mx-8"
        style={{ background: 'linear-gradient(180deg, rgba(198,184,164,0.14) 0%, rgba(198,184,164,0.30) 100%)' }}
      >
        <div className="w-full max-w-4xl text-center mx-auto px-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl md:text-4xl">Be First In</CardTitle>
                    <CardDescription className="text-lg text-beige-dark mt-2 max-w-3xl mx-auto font-body">
                        HighVibe Retreats is launching soon. Join the waitlist for early access and founder-level perks.
                    </CardDescription>
                    <p className="text-base text-foreground pt-4 max-w-3xl mx-auto font-body font-semibold">
                        {HOMEPAGE_PERK_TEASER}
                    </p>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button size="lg" onClick={() => {
                      setDefaultRole("");
                      setModalSource("landing-card");
                      setIsWaitlistModalOpen(true);
                  }}>Join the Waitlist</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
    </>
  );
}
