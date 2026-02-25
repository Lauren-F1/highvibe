
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Link from 'next/link';

// This is a generic status that can be used from the perspective of a Guide or a Host
export type ConnectionStatus = 
  // Guide-centric
  | 'Not Invited' 
  | 'Invite Sent' 
  // Host-centric
  | 'Not Connected'
  | 'Connection Requested'
  | 'New Request'
  // Universal
  | 'In Conversation' 
  | 'Confirmed' 
  | 'Booked' 
  | 'Declined';

export interface Guide {
  id: string;
  uid: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  upcomingRetreatsCount: number;
  retreatTypes?: string[];
  vibeTags?: string[];
  premiumMembership?: boolean;
  isSample?: boolean;
  profileSlug?: string;
}

export interface GuideCardProps {
  guide: Guide;
  onConnect?: (guide: Guide) => void;
  onViewMessage?: (guide: Guide) => void;
  connectionStatus?: ConnectionStatus;
}

const defaultAvatarUrl = '/profile-avatar-placeholder.jpg';

export function GuideCard({ guide, onConnect, onViewMessage, connectionStatus = 'Not Connected' }: GuideCardProps) {
  const avatarUrl = guide.avatar || defaultAvatarUrl;

  const renderActionButton = () => {
    if (!onConnect) return null;

    switch (connectionStatus) {
      case 'In Conversation':
      case 'New Request':
        return <Button onClick={() => onViewMessage?.(guide)} className="w-full">Message</Button>;
      case 'Not Connected':
      case 'Not Invited':
        return <Button onClick={() => onConnect(guide)} className="w-full">Connect</Button>;
      case 'Declined':
         return <Button onClick={() => onConnect(guide)} className="w-full" variant="secondary">Connect Again</Button>;
      case 'Invite Sent':
      case 'Connection Requested':
        return <Button className="w-full" disabled>Requested</Button>;
      default:
        return <Button className="w-full" disabled>{connectionStatus}</Button>;
    }
  };

  const statusBadge = () => {
      if (connectionStatus === 'Not Connected' || connectionStatus === 'Not Invited') return null;
      
      let variant: "default" | "secondary" | "destructive" | "outline" = 'secondary';
      if (['In Conversation', 'Confirmed', 'Booked', 'New Request'].includes(connectionStatus)) variant = 'default';
      if (connectionStatus === 'Declined') variant = 'destructive';
      
      return <Badge variant={variant} className="ml-2">{connectionStatus}</Badge>
  }

  return (
    <Card className="w-full overflow-hidden flex flex-col h-full">
      <CardContent className="flex items-center gap-4 p-4 flex-grow">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={avatarUrl} 
            alt={guide.name}
          />
          <AvatarFallback>{guide.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
             <CardTitle className="text-lg flex items-center">{guide.name} {statusBadge()}</CardTitle>
             {guide.premiumMembership && <Badge variant="secondary">Featured</Badge>}
          </div>
          <CardDescription>{guide.specialty}</CardDescription>
          <div className="flex items-center mt-1">
            <Rating value={guide.rating} />
            <span className="ml-2 text-xs text-muted-foreground">({guide.reviewCount} reviews)</span>
          </div>
           <p className="text-xs text-muted-foreground mt-1">{guide.upcomingRetreatsCount} upcoming retreats</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        <Button asChild variant="outline" className="w-full">
            <Link href={guide.profileSlug ? `/u/${guide.profileSlug}` : '#'}>Profile</Link>
        </Button>
        {renderActionButton()}
      </CardFooter>
    </Card>
  );
}

interface RatingProps {
  value: number;
  max?: number;
  className?: string;
}

function Rating({ value, max = 5, className }: RatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < Math.floor(value) ? 'text-primary fill-primary' : 'text-muted-foreground/50'
          )}
        />
      ))}
    </div>
  );
}

    