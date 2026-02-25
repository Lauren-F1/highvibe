
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from './icons/logo';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WaitlistModal } from './waitlist-modal';
import { Button } from './ui/button';
import * as analytics from '@/lib/analytics';
import Image from 'next/image';
import { RoleIcon } from './icons/role-icon';
import { getPlaceholderById } from '@/lib/placeholder-images';

interface Role {
  id: 'seeker' | 'guide' | 'vendor' | 'host';
  href: string;
  primaryLabel: string;
  title: string;
  description: string;
}

const roles: Role[] = [
    {
      id: 'seeker',
      href: "/seeker",
      primaryLabel: "Seeker",
      title: "I’m Seeking a Retreat",
      description: "Discover retreats aligned with leadership, wellness, creativity, healing, and personal growth."
    },
    {
      id: 'guide',
      href: "/guide",
      primaryLabel: "Guide",
      title: "I’m Leading a Retreat",
      description: "Design and lead meaningful retreat experiences. Find the right space and trusted vendors."
    },
    {
      id: 'vendor',
      href: "/vendor",
      primaryLabel: "Vendor",
      title: "I’m Offering Retreat Services",
      description: "Offer services that make retreats unforgettable — from wellness and music to food and transport."
    },
    {
      id: 'host',
      href: "/host",
      primaryLabel: "Host",
      title: "I’m Listing a Retreat Space",
      description: "List a property designed for retreats, gatherings, and immersive experiences."
    },
];

export default function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [defaultRole, setDefaultRole] = useState<"Seeker" | "Guide" | "Host" | "Vendor" | "">("");
  const [modalSource, setModalSource] = useState("homepage-role-card");

  const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true';

  useEffect(() => {
    analytics.event('landing_view', { category: 'engagement' });

    const reason = searchParams.get('reason');
    if (reason) {
        toast({
            title: 'Prelaunch Access Is Limited',
            description: "We're currently in a prelaunch phase. Join the waitlist to be notified.",
            duration: 5000,
        });
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
  
  return (
    <>
    <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onOpenChange={setIsWaitlistModalOpen}
        source={modalSource}
        defaultRole={defaultRole}
    />
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl flex flex-col items-center">
        {/* Logo Section - Spans container width */}
        <div className="w-full mb-6">
          <Logo />
        </div>

        {/* Hero Image Section - Edge to edge with logo */}
        <div className="w-full mb-12">
          <div className="p-2 md:p-4 bg-gradient-to-b from-[#c6b8a4]/10 to-[#c6b8a4]/30">
            <div className="relative aspect-[21/9] w-full overflow-hidden">
              <Image
                src={getPlaceholderById('resort-hero')}
                alt="Beautiful resort view"
                fill
                className="object-cover"
                priority
                data-ai-hint="resort view"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl text-center mb-16">
        <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl mb-4">Choose your role. Find your people.</h2>
        <p className="text-xl text-beige-dark max-w-3xl mx-auto font-body">Book experiences or create them. HighVibe connects retreat leaders with aligned spaces and trusted vendors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mb-24">
        {roles.map((role) => (
          <div
            key={role.id}
            tabIndex={0}
            onClick={() => handleRoleClick(role)}
            className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <Card className="h-full border-primary/20 hover:border-primary/50 transition-all hover:shadow-xl">
              <CardHeader className="items-center text-center pb-2">
                <CardTitle className="font-headline text-4xl text-beige tracking-wider mb-4">{role.primaryLabel}</CardTitle>
                <RoleIcon roleId={role.id} />
                <h3 className="font-body text-xl font-semibold mt-4">{role.title}</h3>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="font-body text-sm text-beige-dark">{role.description}</CardDescription>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </main>
    </>
  );
}
