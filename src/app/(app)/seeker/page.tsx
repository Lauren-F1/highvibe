import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RetreatCard } from '@/components/retreat-card';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const retreats = [
  { id: '1', title: 'Serene Yoga Escape', description: 'Find your inner peace with daily yoga and meditation sessions.', location: 'Bali, Indonesia', price: 400, rating: 4.8, image: placeholderImages[0] },
  { id: '2', title: 'Forest Bathing & Mindfulness', description: 'Reconnect with nature through guided forest walks and mindfulness.', location: 'Kyoto, Japan', price: 550, rating: 4.9, image: placeholderImages[1] },
  { id: '3', title: 'Andean Peaks Adventure', description: 'Challenge yourself with high-altitude treks and stunning vistas.', location: 'Cusco, Peru', price: 1200, rating: 5.0, image: placeholderImages[2] },
  { id: '4', title: 'Cozy Writer\'s Retreat', description: 'Unleash your creativity in a peaceful cabin environment.', location: 'Vermont, USA', price: 350, rating: 4.7, image: placeholderImages[3] },
  { id: '5', title: 'Gourmet Wellness Journey', description: 'Nourish your body and soul with healthy, delicious cuisine.', location: 'Tuscany, Italy', price: 750, rating: 4.9, image: placeholderImages[4] },
  { id: '6', title: 'Ultimate Spa & Relaxation', description: 'Indulge in daily spa treatments and complete relaxation.', location: 'Phuket, Thailand', price: 600, rating: 4.8, image: placeholderImages[5] },
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
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative text-white px-4">
            <h1 className="font-headline text-4xl md:text-5xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">Find Your Next Experience</h1>
            <p className="text-slate-100 mt-2 text-xl max-w-3xl mx-auto font-body [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              Curated retreats for those who choose curiosity, connection, and living well.
            </p>
          </div>
        </div>
      )}

      <Card className="mb-8 p-4 md:p-6 bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="type">Explore Retreats</Label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="meditation">Meditation</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g., Bali, Indonesia" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Max Price</Label>
            <Select>
              <SelectTrigger id="price">
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">$500</SelectItem>
                <SelectItem value="1000">$1000</SelectItem>
                <SelectItem value="2000">$2000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="lg" className="w-full">Search Retreats</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {retreats.map((retreat) => (
          <RetreatCard key={retreat.id} retreat={retreat} />
        ))}
      </div>
    </div>
  );
}
