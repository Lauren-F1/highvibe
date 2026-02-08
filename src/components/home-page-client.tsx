'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { SeekerIcon } from '@/components/icons/seeker-icon';
import { HostIcon } from '@/components/icons/host-icon';
import { VendorIcon } from '@/components/icons/vendor-icon';
import { SpaceOwnerIcon } from '@/components/icons/space-owner-icon';
import { placeholderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import React from 'react';

interface Role {
  id: 'seeker' | 'guide' | 'vendor' | 'host';
  href: string;
  icon: React.ReactNode;
  primaryLabel: string;
  title: string;
  description: string;
}

const roles: Role[] = [
    {
      id: 'seeker',
      href: "/seeker",
      icon: <SeekerIcon />,
      primaryLabel: "Seeker",
      title: "I’m Seeking a Retreat",
      description: "Discover retreats aligned with leadership, wellness, creativity, healing, and personal growth. Get notified when experiences that match what you’re seeking become available."
    },
    {
      id: 'guide',
      href: "/guide",
      icon: <HostIcon />,
      primaryLabel: "Guide",
      title: "I’m Leading a Retreat",
      description: "Design and lead meaningful retreat experiences. Find the right space, connect with aligned seekers, and collaborate with trusted vendors to bring your vision to life."
    },
    {
      id: 'vendor',
      href: "/vendor",
      icon: <VendorIcon />,
      primaryLabel: "Vendor",
      title: "I’m Offering Retreat Services",
      description: "Offer services that make retreats unforgettable — from wellness and music to food, transportation, and curated local experiences. Connect with guides and hosts looking to elevate their retreats."
    },
    {
      id: 'host',
      href: "/host",
      icon: <SpaceOwnerIcon />,
      primaryLabel: "Host",
      title: "I’m Listing a Retreat Space",
      description: "List a property designed for retreats, gatherings, and immersive experiences. Connect with guides seeking beautiful, well-suited spaces for meaningful retreat experiences."
    },
];


export default function HomePageClient() {
  const router = useRouter();
  const heroImage = placeholderImages.find((img) => img.id === 'resort-hero');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, role: Role) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelectRole(role);
    }
  };
  
  const handleContinue = () => {
    if (selectedRole) {
      router.push(selectedRole.href);
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
        <h2 className="font-headline text-3xl md:text-4xl">Every journey begins with participation.</h2>
        <p className="text-lg text-beige-dark mt-2 max-w-3xl mx-auto">Choose the role most aligned with what brought you here. You can add more ways to participate as your path unfolds.</p>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl mb-8"
        role="radiogroup"
        aria-label="Select your role"
      >
        {roles.map((role) => {
          const isSelected = selectedRole?.id === role.id;
          return (
            <div
              key={role.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelectRole(role)}
              onKeyDown={(e) => handleKeyDown(e, role)}
              className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
            >
              <Card className={cn(
                  "h-full w-full transition-all duration-200 ease-in-out relative p-6",
                  "hover:shadow-xl hover:border-primary/50",
                  isSelected ? 'border-primary shadow-xl bg-accent/50' : 'border-border',
                  selectedRole && !isSelected ? 'opacity-70 hover:opacity-100' : ''
              )}>
                {isSelected && <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary" />}
                <CardHeader className="items-center text-center p-0">
                  <CardTitle className="font-headline text-4xl text-beige tracking-wider mb-3">{role.primaryLabel}</CardTitle>
                  <div className="flex items-center justify-center mb-3">
                    {React.cloneElement(role.icon as React.ReactElement, { className: cn("text-primary", role.id === 'seeker' ? "w-24 h-24" : "w-20 h-20") })}
                  </div>
                  <h3 className="font-body text-base text-foreground font-semibold">{role.title}</h3>
                </CardHeader>
                <CardContent className="text-center px-2 pb-2 pt-4">
                  <CardDescription className="font-body text-[13px] leading-snug text-muted-foreground">{role.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
      
      <div className="w-full max-w-sm">
        <Button
          size="lg"
          className="w-full"
          disabled={!selectedRole}
          onClick={handleContinue}
        >
          {selectedRole ? `Continue as ${selectedRole.primaryLabel}` : 'Continue'}
        </Button>
      </div>

    </main>
  );
}
