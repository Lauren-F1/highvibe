"use client";

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { VendorCard } from '@/components/vendor-card';
import { placeholderImages } from '@/lib/placeholder-images';
import { PlusCircle } from 'lucide-react';

const sampleVendor = {
  id: '1',
  name: 'Elena Ray',
  service: 'Catering & Nutrition',
  rating: 4.9,
  reviewCount: 88,
  avatar: placeholderImages[7]
};

export default function VendorPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Grow Your Business</h1>
          <p className="text-muted-foreground mt-2 text-lg">Offer the elements that make retreats unforgettable, from private chefs and musicians to transportation, photography, wellness, and bespoke experiences.</p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Your Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Preview</CardTitle>
            <CardDescription>This is how guides will see your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <VendorCard vendor={sampleVendor} />
          </CardContent>
        </Card>
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
              <p>Create your vendor profile highlighting your skills and pricing.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
              <p>Get discovered by retreat guides looking for your services.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
              <p>Communicate and get hired directly through the platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
