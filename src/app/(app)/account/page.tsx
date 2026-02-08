'use client';

import { useUser } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProfileLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto animate-pulse">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start gap-6">
            <div className="bg-muted rounded-full h-24 w-24 shrink-0"></div>
            <div className='w-full space-y-3'>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </CardContent>
          <CardFooter className="gap-2">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


export default function AccountPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user.status === 'unauthenticated') {
      router.replace('/login?redirect=/account');
    }
  }, [user, router]);

  if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
    return <ProfileLoadingSkeleton />;
  }

  if (user.status === 'unauthenticated' || !user.profile) {
    return <ProfileLoadingSkeleton />;
  }

  const { profile } = user;
  const { 
    displayName, 
    headline, 
    bio, 
    roles, 
    locationLabel, 
    isWillingToTravel, 
    travelRadiusMiles, 
    avatarUrl, 
    galleryUrls,
    profileSlug
  } = profile;

  const userInitial = displayName?.charAt(0) || user.data.email?.charAt(0) || 'U';


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 shrink-0 border-2">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                    <CardTitle className="font-headline text-4xl">{displayName}</CardTitle>
                    {headline && <p className="text-lg text-muted-foreground mt-1">{headline}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {roles?.map(role => (
                            <Badge key={role} variant="secondary" className="capitalize">{role}</Badge>
                        ))}
                    </div>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {(locationLabel || isWillingToTravel) && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                {locationLabel && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{locationLabel}</span>
                  </div>
                )}
                {isWillingToTravel && (
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    <span>
                      {travelRadiusMiles && travelRadiusMiles > 0
                        ? `Willing to travel up to ${travelRadiusMiles} miles`
                        : 'Willing to travel'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {bio && (
                <div>
                    <h3 className="font-semibold mb-2">About Me</h3>
                    <p className="whitespace-pre-wrap">{bio}</p>
                </div>
            )}
            
            {galleryUrls && galleryUrls.length > 0 && (
              <div>
                  <h3 className="font-semibold mb-2">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                               <Image src={url} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
                          </div>
                      ))}
                  </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            <Button asChild><Link href="/account/edit">Edit Profile</Link></Button>
            {profileSlug && <Button asChild variant="outline"><Link href={`/u/${profileSlug}`}>View Public Profile</Link></Button>}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
