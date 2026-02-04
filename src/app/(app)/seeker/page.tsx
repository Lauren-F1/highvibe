'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RetreatCard } from '@/components/retreat-card';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const retreats = [
  { id: '1', title: 'Serene Yoga Escape', description: 'A grounding escape designed for deep rest, clarity, and reconnection.', location: 'Bali, Indonesia', price: 400, rating: 4.8, image: placeholderImages[0] },
  { id: '2', title: 'Forest Bathing & Mindfulness', description: 'An invitation to slow down, awaken your senses, and find presence in the heart of nature.', location: 'Kyoto, Japan', price: 550, rating: 4.9, image: placeholderImages[1] },
  { id: '3', title: 'Andean Peaks Adventure', description: 'For those who crave altitude and challenge, this is an ascent into unforgettable landscapes.', location: 'Cusco, Peru', price: 1200, rating: 5.0, image: placeholderImages[2] },
  { id: '4', title: 'Cozy Writer\'s Retreat', description: 'A quiet sanctuary designed for the creative soul, where inspiration flows and your next story awaits.', location: 'Vermont, USA', price: 350, rating: 4.7, image: placeholderImages[3] },
  { id: '5', title: 'Gourmet Wellness Journey', description: 'A culinary journey to nourish and delight, designed to celebrate vibrant, wholesome food and mindful eating.', location: 'Tuscany, Italy', price: 750, rating: 4.9, image: placeholderImages[4] },
  { id: '6', title: 'Ultimate Spa & Relaxation', description: 'Your permission to completely unwind. A week of pure indulgence and restorative care designed for total rejuvenation.', location: 'Phuket, Thailand', price: 600, rating: 4.8, image: placeholderImages[5] },
];

export default function SeekerPage() {
  const heroImage = placeholderImages.find(p => p.id === 'seeker-hero-panoramic');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {heroImage && (
        <div className="relative mb-8 w-full aspect-[21/9] rounded-lg overflow-hidden flex items-center justify-center text-center">
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
          <div className="relative text-white px-4">
            <h1 className="font-headline text-4xl md:text-6xl font-bold [text-shadow:0_4px_12px_rgba(0,0,0,0.8)]">Find Your Next Experience</h1>
            <p className="text-slate-100 mt-2 text-xl md:text-2xl max-w-3xl mx-auto font-body [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
              Curated retreats for those who choose curiosity, connection, and living well.
            </p>
          </div>
        </div>
      )}

      <Card className="mb-8 p-4 md:p-6 bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base">Experience Type</Label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="All Experiences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wellness-healing">Wellness & Healing</SelectItem>
                <SelectItem value="meditation-mindfulness">Meditation & Mindfulness</SelectItem>
                <SelectItem value="yoga-movement">Yoga & Movement</SelectItem>
                <SelectItem value="personal-growth">Personal Growth</SelectItem>
                <SelectItem value="guided-plant-medicine">Guided Plant Medicine</SelectItem>
                <SelectItem value="spirituality-consciousness">Spirituality & Consciousness</SelectItem>
                <SelectItem value="adventure-exploration">Adventure & Exploration</SelectItem>
                <SelectItem value="nature-immersion">Nature & Immersion</SelectItem>
                <SelectItem value="creativity">Creativity</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="intent" className="text-base">Intent (What are you seeking?)</Label>
            <Select>
              <SelectTrigger id="intent">
                <SelectValue placeholder="Select an intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rest-reset">Rest & Reset</SelectItem>
                <SelectItem value="healing-integration">Healing & Integration</SelectItem>
                <SelectItem value="personal-growth">Personal Growth</SelectItem>
                <SelectItem value="connection-relationships">Connection & Relationships</SelectItem>
                <SelectItem value="leadership-professional-growth">Leadership & Professional Growth</SelectItem>
                <SelectItem value="purpose-meaning">Purpose & Meaning</SelectItem>
                <SelectItem value="adventure-aliveness">Adventure & Aliveness</SelectItem>
                <SelectItem value="creativity">Creativity</SelectItem>
                <SelectItem value="spiritual-exploration">Spiritual Exploration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base">Location</Label>
            <Input id="location" placeholder="Where do you want to go?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-base">Investment Range</Label>
            <Select>
              <SelectTrigger id="price">
                <SelectValue placeholder="Any Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">$500</SelectItem>
                <SelectItem value="1000">$1000</SelectItem>
                <SelectItem value="2000">$2000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="lg" className="w-full md:col-span-2 lg:col-span-4 text-base tracking-wider">Explore Experiences</Button>
        </div>
      </Card>

      <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Experiences We’re Loving</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {retreats.map((retreat) => (
          <RetreatCard key={retreat.id} retreat={retreat} />
        ))}
      </div>
    </div>
  );
}
