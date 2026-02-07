"use client";

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { VendorCard } from '@/components/vendor-card';
import { placeholderImages } from '@/lib/placeholder-images';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';

const sampleSpace = {
  name: 'The Glass House',
  location: 'Topanga, California',
  capacity: 'Up to 25 guests',
  image: placeholderImages[6]
}

const sampleProfile = {
  id: '1',
  name: 'My Spaces',
  service: 'Retreat Venues',
  rating: 4.9,
  reviewCount: 42,
  avatar: placeholderImages[10]
}

export default function SpaceOwnerPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Host Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg font-body">Offer a space designed for retreat experiences.</p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0">
          <PlusCircle className="mr-2 h-5 w-5" />
          List Your Space
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Listing Preview</CardTitle>
              <CardDescription>This is how guides will see your space.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                 <Image
                    src={sampleSpace.image.imageUrl}
                    alt={sampleSpace.image.description}
                    data-ai-hint={sampleSpace.image.imageHint}
                    fill
                    className="object-cover"
                  />
              </div>
              <div className="mt-4">
                <h3 className="font-headline text-2xl">{sampleSpace.name}</h3>
                <p className="text-muted-foreground font-body">{sampleSpace.location}</p>
                <p className="mt-2 text-sm font-body">{sampleSpace.capacity}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Your identity as a Host.</CardDescription>
            </CardHeader>
            <CardContent>
              <VendorCard vendor={sampleProfile} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
