
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Users, Bed, Bath } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { type ConnectionStatus } from './guide-card';

export interface Host {
  id: string;
  name: string;
  location: string;
  capacity: number;
  eventCapacity?: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  propertyType: string;
  image?: string;
  luxApproved: boolean;
  premiumMembership?: boolean;
  roomStyleTags?: string[];
  retreatReady?: boolean;
  gatheringSpace?: boolean;
  quietSetting?: boolean;
  kitchenType?: ('full' | 'commercial')[];
  cateringAllowed?: boolean;
  privateChefAllowed?: boolean;
  policyTags?: string[];
  profileSlug?: string;
  hostLat?: number;
  hostLng?: number;
  hostAddress?: string;
  hostCity?: string;
  hostStateRegion?: string;
}

interface HostCardProps {
  host: Host;
  onConnect?: (host: Host) => void;
  onViewMessage?: (partner: Host) => void;
  connectionStatus?: ConnectionStatus;
  connectActionLabel?: string;
}

const defaultImageUrl = '/generic-placeholder.jpg';


export function HostCard({ host, onConnect, onViewMessage, connectionStatus = 'Not Invited', connectActionLabel = "Invite" }: HostCardProps) {
  const imageUrl = host.image || defaultImageUrl;

  const renderActionButton = () => {
    if (!onConnect || !onViewMessage) return null;

    switch (connectionStatus) {
      case 'In Conversation':
      case 'New Request':
        return <Button onClick={() => onViewMessage(host)} className="w-full">Message</Button>;
      case 'Not Invited':
      case 'Not Connected':
        return <Button onClick={() => onConnect(host)} className="w-full">{connectActionLabel}</Button>;
      case 'Declined':
         return <Button onClick={() => onConnect(host)} className="w-full" variant="secondary">{connectActionLabel === 'Invite' ? 'Re-Invite' : 'Connect Again'}</Button>;
      case 'Invite Sent':
      case 'Connection Requested':
        return <Button className="w-full" disabled>Requested</Button>;
      default:
        return <Button className="w-full" disabled>{connectionStatus}</Button>;
    }
  };

  const statusBadge = () => {
      if (connectionStatus === 'Not Invited' || connectionStatus === 'Not Connected') return null;
      let variant: "default" | "secondary" | "destructive" | "outline" = 'secondary';
      if (['In Conversation', 'Confirmed', 'Booked', 'New Request'].includes(connectionStatus)) variant = 'default';
      if (connectionStatus === 'Declined') variant = 'destructive';
      
      return <Badge variant={variant} className="ml-2">{connectionStatus}</Badge>
  }


  return (
    <Card className="w-full overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col h-full">
      <div className="relative aspect-[4/3] w-full">
         <Image
            src={imageUrl}
            alt={host.name}
            fill
            className="object-cover"
        />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-muted-foreground">{host.propertyType}</p>
                    <h3 className="font-headline text-xl font-bold flex items-center">{host.name} {statusBadge()}</h3>
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
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-2 border-t pt-2">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Users className="mr-1.5 h-4 w-4" />
                        <span>{host.capacity} guests</span>
                    </div>
                    <div className="flex items-center">
                        <Bed className="mr-1.5 h-4 w-4" />
                        <span>{host.bedrooms} beds</span>
                    </div>
                     <div className="flex items-center">
                        <Bath className="mr-1.5 h-4 w-4" />
                        <span>{host.bathrooms} baths</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {host.premiumMembership && (
                        <Badge variant="secondary">Featured</Badge>
                    )}
                    {host.luxApproved && (
                        <Badge variant="outline">LUX</Badge>
                    )}
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center gap-2">
         <Button asChild variant="outline" className="w-full">
            <Link href={host.profileSlug ? `/u/${host.profileSlug}` : '#'}>Profile</Link>
         </Button>
         {renderActionButton()}
      </CardFooter>
    </Card>
  );
}

    