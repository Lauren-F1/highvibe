'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface RetreatCardProps {
  retreat: {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    rating: number;
    image: ImagePlaceholder;
  };
}

export function RetreatCard({ retreat }: RetreatCardProps) {
  return (
    <Card className="w-full overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/20">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
                <CardTitle className="font-headline text-xl mb-2">{retreat.title}</CardTitle>
                <CardDescription className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {retreat.location}
                </CardDescription>
            </div>
            <div className="relative w-20 h-20 shrink-0">
                 <Image
                    src={retreat.image.imageUrl}
                    alt={retreat.image.description}
                    data-ai-hint={retreat.image.imageHint}
                    fill
                    className="object-cover rounded-md"
                />
            </div>
        </div>
        <p className="text-sm line-clamp-2 font-body mb-4">{retreat.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className="flex items-center">
          <Rating value={retreat.rating} />
          <span className="ml-2 text-xs text-muted-foreground">({retreat.rating})</span>
        </div>
        <div className="text-lg font-bold text-foreground">
          ${retreat.price}
          <span className="text-sm font-normal text-muted-foreground">/night</span>
        </div>
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
