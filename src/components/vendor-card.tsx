'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    service: string;
    rating: number;
    reviewCount: number;
    avatar: ImagePlaceholder;
  };
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={vendor.avatar.imageUrl} 
            alt={vendor.name} 
            data-ai-hint={vendor.avatar.imageHint}
          />
          <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="text-lg">{vendor.name}</CardTitle>
          <CardDescription>{vendor.service}</CardDescription>
          <div className="flex items-center mt-1">
            <Rating value={vendor.rating} />
            <span className="ml-2 text-xs text-muted-foreground">({vendor.reviewCount} reviews)</span>
          </div>
        </div>
      </CardContent>
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
