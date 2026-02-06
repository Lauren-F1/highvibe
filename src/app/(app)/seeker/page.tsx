'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RetreatCard } from '@/components/retreat-card';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const retreats = [
  { id: '1', title: 'Serene Yoga Escape', description: 'A grounding escape designed for deep rest, clarity, and reconnection.', location: 'Bali, Indonesia', price: 400, rating: 4.8, image: placeholderImages.find(p => p.id === 'yoga-beach')! },
  { id: '2', title: 'Forest Bathing & Mindfulness', description: 'An invitation to slow down, awaken your senses, and find presence in the heart of nature.', location: 'Kyoto, Japan', price: 550, rating: 4.9, image: placeholderImages.find(p => p.id === 'meditation-forest')! },
  { id: '3', title: 'Andean Peaks Adventure', description: 'For those who crave altitude and challenge, this is an ascent into unforgettable landscapes.', location: 'Cusco, Peru', price: 1200, rating: 5.0, image: placeholderImages.find(p => p.id === 'mountain-hike')! },
  { id: '4', title: 'Cozy Writer\'s Retreat', description: 'A quiet sanctuary designed for the creative soul, where inspiration flows and your next story awaits.', location: 'Vermont, USA', price: 350, rating: 4.7, image: placeholderImages.find(p => p.id === 'cozy-cabin')! },
  { id: '5', title: 'Gourmet Wellness Journey', description: 'A culinary journey to nourish and delight, designed to celebrate vibrant, wholesome food and mindful eating.', location: 'Tuscany, Italy', price: 750, rating: 4.9, image: placeholderImages.find(p => p.id === 'healthy-food-chef')! },
  { id: '6', title: 'Ultimate Spa & Relaxation', description: 'Your permission to completely unwind. A week of pure indulgence and restorative care designed for total rejuvenation.', location: 'Phuket, Thailand', price: 600, rating: 4.8, image: placeholderImages.find(p => p.id === 'spa-massage')! },
];

const experienceTypes = [
    { value: 'all-experiences', label: 'All Experiences' },
    { value: 'rest-reset', label: 'Rest & Reset' },
    { value: 'wellness-healing', label: 'Wellness & Healing' },
    { value: 'yoga-meditation', label: 'Yoga & Meditation' },
    { value: 'personal-growth-self-development', label: 'Personal Growth & Self-Development' },
    { value: 'spiritual-exploration', label: 'Spiritual Exploration' },
    { value: 'plant-medicine-ceremony', label: 'Plant Medicine & Ceremony' },
    { value: 'relationships-connection', label: 'Relationships & Connection' },
    { value: 'leadership-professional-growth', label: 'Leadership & Professional Growth' },
    { value: 'adventure-aliveness', label: 'Adventure & Aliveness' },
    { value: 'creativity-expression', label: 'Creativity & Expression' },
    { value: 'nature-immersion', label: 'Nature Immersion' },
    { value: 'transformation', label: 'Transformation' },
];

const continents = [
    { value: 'anywhere', label: 'Anywhere' },
    { value: 'africa', label: 'Africa' },
    { value: 'asia', label: 'Asia' },
    { value: 'europe', label: 'Europe' },
    { value: 'north-america', label: 'North America' },
    { value: 'south-america', label: 'South America' },
    { value: 'oceania', label: 'Oceania' },
    { value: 'middle-east', label: 'Middle East' },
];

const destinations: Record<string, string[]> = {
  africa: ['Morocco', 'South Africa', 'Kenya', 'Tanzania', 'Egypt', 'Namibia', 'Rwanda', 'Seychelles'],
  asia: ['Bali, Indonesia', 'Thailand', 'Japan', 'India', 'Nepal', 'Sri Lanka', 'Vietnam', 'Cambodia', 'Philippines', 'Bhutan'],
  europe: ['Italy', 'France', 'Portugal', 'Spain', 'Greece', 'Switzerland', 'Austria', 'Iceland', 'Croatia', 'United Kingdom'],
  'north-america': ['California, USA', 'Utah, USA', 'Arizona, USA', 'Colorado, USA', 'Vermont, USA', 'British Columbia, Canada', 'Baja California, Mexico', 'Costa Rica'],
  'south-america': ['Peru', 'Colombia', 'Brazil', 'Argentina', 'Chile', 'Ecuador', 'Patagonia (Region)'],
  oceania: ['New Zealand', 'Australia', 'Fiji', 'Tahiti (French Polynesia)', 'Hawaii, USA'],
  'middle-east': ['Jordan', 'Oman', 'United Arab Emirates', 'Turkey', 'Israel', 'Lebanon'],
};

const investmentRanges = [
  { value: "any", label: "Any Range" },
  { value: "under-500", label: "Under $500" },
  { value: "500-1000", label: "$500–$1,000" },
  { value: "1000-3000", label: "$1,000–$3,000" },
  { value: "3000-7500", label: "$3,000–$7,500" },
  { value: "7500-15000", label: "$7,500–$15,000" },
  { value: "15000-30000", label: "$15,000–$30,000" },
  { value: "30000-50000", label: "$30,000–$50,000" },
  { value: "50000-100000", label: "$50,000–$100,000" },
  { value: "over-100000", label: "$100,000+" },
];

export default function SeekerPage() {
  const heroImage = placeholderImages.find(p => p.id === 'seeker-hero-panoramic');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const mostExpensiveRetreatId = retreats.reduce((prev, current) => (prev.price > current.price) ? prev : current).id;

  const showRegionFilter = selectedContinent && selectedContinent !== 'anywhere' && destinations[selectedContinent];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {heroImage && (
        <div className="relative mb-8 w-full aspect-[21/9] rounded-lg overflow-hidden flex items-center justify-center text-center">
           <div className="absolute inset-0 bg-black/30 z-10"></div>
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
          <div className="relative text-white px-4 z-20">
            <h1 className="font-headline text-4xl md:text-5xl font-bold [text-shadow:0_4px_12px_rgba(0,0,0,0.8)]">Find Your Next Experience</h1>
            <p className="text-slate-100 mt-2 text-lg md:text-xl max-w-3xl mx-auto font-body [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
              Curated retreats for those who choose curiosity, connection, and living well.
            </p>
          </div>
        </div>
      )}

      <Card className="mb-8 p-4 md:p-6 bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="type">Choose Your Experience</Label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="All Experiences" />
              </SelectTrigger>
              <SelectContent>
                {experienceTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Select onValueChange={(value) => {
              setSelectedContinent(value);
              setSelectedRegion('');
            }}>
              <SelectTrigger id="destination">
                <SelectValue placeholder="Anywhere in the world" />
              </SelectTrigger>
              <SelectContent>
                {continents.map(continent => (
                  <SelectItem key={continent.value} value={continent.value}>{continent.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showRegionFilter ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="region">Region / Country</Label>
                <Select onValueChange={setSelectedRegion} value={selectedRegion}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select a country or region" />
                  </Trigger>
                  <SelectContent>
                    {(destinations[selectedContinent] || []).map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                 <Label htmlFor="price">Investment Range</Label>
                 <Select>
                   <SelectTrigger id="price">
                     <SelectValue placeholder="Any Range" />
                   </SelectTrigger>
                   <SelectContent>
                     {investmentRanges.map((range) => (
                       <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <Button size="lg" className="w-full md:col-span-full">Explore Experiences</Button>
            </>
          ) : (
             <>
                <div className="space-y-2">
                    <Label htmlFor="price">Investment Range</Label>
                    <Select>
                    <SelectTrigger id="price">
                        <SelectValue placeholder="Any Range" />
                    </SelectTrigger>
                    <SelectContent>
                        {investmentRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <Button size="lg" className="w-full md:col-span-2 lg:col-span-1">Explore Experiences</Button>
            </>
          )}
        </div>
      </Card>

      <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Experiences We’re Loving</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {retreats.map((retreat) => (
          <RetreatCard key={retreat.id} retreat={retreat} isLux={retreat.id === mostExpensiveRetreatId} />
        ))}
      </div>
    </div>
  );
}
