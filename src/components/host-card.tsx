'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Bed } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Button } from './ui/button';

export interface Host {
  id: string;
  name: string;
  location: string;
  capacity: number;
  bedrooms: number;
  pricePerNight: number;
  propertyType: string;
  image: ImagePlaceholder;
  luxApproved: boolean;
}

interface HostCardProps {
  host: Host;
  onConnect: () => void;
}

export function HostCard({ host, onConnect }: HostCardProps) {
  return (
    <Card className="w-full overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col h-full">
      <div className="relative aspect-[4/3] w-full">
         <Image
            src={host.image.imageUrl}
            alt={host.image.description}
            data-ai-hint={host.image.imageHint}
            fill
            className="object-cover"
        />
        {host.luxApproved && (
            <div className="absolute top-3 right-3">
                 <Image
                    src="/lux.png"
                    alt="LUX Approved"
                    width={36}
                    height={36}
                />
            </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-muted-foreground">{host.propertyType}</p>
                    <h3 className="font-headline text-xl font-bold">{host.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="mr-2 h-4 w-4" />
                        {host.location}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-bold text-lg">${host.pricePerNight}</p>
                    <p className="text-xs text-muted-foreground">/ night</p>
                </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-2 border-t pt-2">
                <div className="flex items-center">
                    <Users className="mr-1.5 h-4 w-4" />
                    <span>{host.capacity} guests</span>
                </div>
                <div className="flex items-center">
                    <Bed className="mr-1.5 h-4 w-4" />
                    <span>{host.bedrooms} beds</span>
                </div>
            </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
         <Button onClick={onConnect} className="w-full">Request to Connect</Button>
      </div>
    </Card>
  );
}
