'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import type { PartnershipStage } from './partnership-stepper';
import Link from 'next/link';

interface NextBestActionProps {
  stage: PartnershipStage;
}

const actions: Record<PartnershipStage, { title: string; cta: string; href: string }> = {
    Draft: {
        title: 'Your retreat is still a draft. Publish it to start finding partners.',
        cta: 'Edit & Publish Retreat',
        href: '#'
    },
    Shortlist: {
        title: 'Start building your team. Find and connect with hosts and vendors that match your vision.',
        cta: 'Find Partners',
        href: '#partnership-dashboard'
    },
    'Invites Sent': {
        title: "You've sent out connection requests. Give them a day or two to respond.",
        cta: 'View Connections',
        href: '#partnership-dashboard'
    },
    'In Conversation': {
        title: 'Conversations are happening! Follow up with your potential partners to finalize details.',
        cta: 'Go to Inbox',
        href: '/inbox'
    },
    Confirmed: {
        title: "You have confirmed partners! Now it's time to lock in the booking details and payment.",
        cta: 'Manage Bookings',
        href: '#'
    },
    Booked: {
        title: 'Your retreat is booked and ready to go. Focus on marketing and preparing for your guests.',
        cta: 'View Retreat',
        href: '#'
    }
};

export function NextBestAction({ stage }: NextBestActionProps) {
  const action = actions[stage];

  if (!action) {
    return null;
  }
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (action.href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(action.href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card className="bg-accent border-primary/20">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
        <Lightbulb className="h-6 w-6 text-primary" />
        <CardTitle className="text-lg font-semibold">Next Step</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
            <p className="text-muted-foreground max-w-lg">{action.title}</p>
            <Button asChild>
              <Link href={action.href} onClick={handleClick}>{action.cta}</Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    