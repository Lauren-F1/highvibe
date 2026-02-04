'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
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
  isLux?: boolean;
}

export function RetreatCard({ retreat, isLux = false }: RetreatCardProps) {
  return (
    <Card className="w-full overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/20">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
                <CardTitle className="font-headline text-2xl mb-2">{retreat.title}</CardTitle>
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
                {isLux && (
                  <Image
                    src="/lux.png"
                    alt="LUX Approved"
                    width={28}
                    height={28}
                    className="absolute right-3 top-3 z-10 h-5 w-auto opacity-80 md:h-7"
                  />
                )}
            </div>
        </div>
        <p className="text-base leading-relaxed line-clamp-2 font-body mb-4">{retreat.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end items-center p-4 pt-0">
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">
            From ${retreat.price}
            <span className="text-sm font-normal text-muted-foreground"> / night</span>
          </div>
          <p className="text-xs text-muted-foreground">Curated experience</p>
        </div>
      </CardFooter>
    </Card>
  );
}
