
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { placeholderImages } from '@/lib/placeholder-images';
import { Badge } from './ui/badge';
import Link from 'next/link';

export interface Guide {
  id: string;
  uid: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatar?: ImagePlaceholder;
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
}

const defaultAvatar = placeholderImages.find(p => p.id === 'profile-avatar-placeholder')!;

export function GuideCard({ guide, onConnect }: GuideCardProps) {
  const avatar = guide.avatar || defaultAvatar;

  return (
    <Card className="w-full overflow-hidden flex flex-col h-full">
      <CardContent className="flex items-center gap-4 p-4 flex-grow">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={avatar.imageUrl} 
            alt={guide.name} 
            data-ai-hint={avatar.imageHint}
          />
          <AvatarFallback>{guide.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
             <CardTitle className="text-lg">{guide.name}</CardTitle>
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
        {onConnect && <Button onClick={() => onConnect(guide)} className="w-full">Connect</Button>}
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
