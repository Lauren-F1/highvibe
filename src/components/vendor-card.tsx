
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import type { Vendor } from '@/lib/mock-data';
import { placeholderImages } from '@/lib/placeholder-images';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { type ConnectionStatus } from './host-card';


export interface VendorCardProps {
  vendor: Vendor;
  onConnect?: (vendor: Vendor) => void;
  onViewMessage?: (partner: Vendor) => void;
  distance?: number;
  connectionStatus?: ConnectionStatus;
}

const defaultAvatar = placeholderImages.find(p => p.id === 'friendly-host-portrait')!;

export function VendorCard({ vendor, onConnect, onViewMessage, distance, connectionStatus = 'Not Invited' }: VendorCardProps) {
  const avatar = vendor.avatar || defaultAvatar;

  const renderActionButton = () => {
    if (!onConnect || !onViewMessage) return null;

    switch (connectionStatus) {
      case 'In Conversation':
        return <Button onClick={() => onViewMessage(vendor)} className="w-full">Message</Button>;
      case 'Not Invited':
        return <Button onClick={() => onConnect(vendor)} className="w-full">Invite</Button>;
      case 'Declined':
        return <Button onClick={() => onConnect(vendor)} className="w-full" variant="secondary">Re-Invite</Button>;
      default:
        return <Button className="w-full" disabled>{connectionStatus}</Button>;
    }
  };

  const statusBadge = () => {
    if (connectionStatus === 'Not Invited') return null;
    let variant: "default" | "secondary" | "destructive" | "outline" = 'secondary';
    if (connectionStatus === 'In Conversation' || connectionStatus === 'Confirmed' || connectionStatus === 'Booked') variant = 'default';
    if (connectionStatus === 'Declined') variant = 'destructive';

    return <Badge variant={variant} className="ml-2">{connectionStatus}</Badge>
  }


  return (
    <Card className="w-full overflow-hidden flex flex-col h-full">
      <CardContent className="flex items-center gap-4 p-4 flex-grow">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={avatar.imageUrl} 
            alt={vendor.name} 
            data-ai-hint={avatar.imageHint}
          />
          <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center">{vendor.name} {statusBadge()}</CardTitle>
            <div className="flex items-center gap-2">
                {vendor.premiumMembership && <Badge variant="secondary">Featured</Badge>}
                {vendor.luxApproved && <Badge variant="outline">LUX</Badge>}
            </div>
          </div>
          <CardDescription>{vendor.category}</CardDescription>
          <div className="flex items-center mt-1">
            <Rating value={vendor.rating} />
            <span className="ml-2 text-xs text-muted-foreground">({vendor.reviewCount} reviews)</span>
          </div>
          {distance !== undefined && distance !== Infinity && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <MapPin className="mr-1.5 h-3 w-3" />
                <span>
                  {distance < 10 ? distance.toFixed(1) : Math.round(distance)} miles away
                </span>
              </div>
            )}
        </div>
      </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href={vendor.profileSlug ? `/u/${vendor.profileSlug}` : '#'}>Profile</Link>
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

    

    
