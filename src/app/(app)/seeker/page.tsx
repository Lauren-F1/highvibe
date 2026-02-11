'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RetreatCard } from '@/components/retreat-card';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { HowItWorksModal } from '@/components/how-it-works-modal';
import { allRetreats as retreats, continents, destinations } from '@/lib/mock-data';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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
  { value: "over-100000", label: "Over $100,000" },
];

const timingOptions = [
  { value: 'exploring', label: 'Just exploring' },
  { value: '3-months', label: 'Within 3 months' },
  { value: '6-months', label: 'Within 6 months' },
  { value: '12-months', label: 'Within 12 months' },
];

const parsePriceRange = (rangeValue: string) => {
    if (rangeValue === 'any') return { min: 0, max: Infinity };
    if (rangeValue.startsWith('under-')) {
        const max = parseInt(rangeValue.replace('under-', ''), 10);
        return { min: 0, max: max };
    }
    if (rangeValue.startsWith('over-')) {
        const min = parseInt(rangeValue.replace('over-', ''), 10);
        return { min: min, max: Infinity };
    }
    const parts = rangeValue.split('-');
    if (parts.length === 2) {
        const min = parseInt(parts[0], 10);
        const max = parseInt(parts[1], 10);
        if (!isNaN(min) && !isNaN(max)) return { min, max };
    }
    return { min: 0, max: Infinity };
};


export default function SeekerPage() {
  const heroImage = placeholderImages.find(p => p.id === 'seeker-hero-panoramic');
  const manifestImage = placeholderImages.find(p => p.id === 'spanish-villa-sunset');
  
  // Filter states
  const [experienceType, setExperienceType] = useState('all-experiences');
  const [selectedContinent, setSelectedContinent] = useState('anywhere');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [investmentRange, setInvestmentRange] = useState('any');
  const [timing, setTiming] = useState('exploring');
  const [searchInitiated, setSearchInitiated] = useState(false);

  const [filteredRetreats, setFilteredRetreats] = useState(retreats);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  
  const mostExpensiveRetreatId = retreats.reduce((prev, current) => (prev.price > current.price) ? prev : current).id;
  
  // Waitlist form state
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistSmsOptIn, setWaitlistSmsOptIn] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    let newFilteredRetreats = [...retreats];

    // Experience Type Filter
    if (experienceType !== 'all-experiences') {
      newFilteredRetreats = newFilteredRetreats.filter(retreat => 
        retreat.type && retreat.type.includes(experienceType)
      );
    }
    
    // Destination filter
    if (selectedContinent !== 'anywhere' && !selectedRegion) {
        const regionsInContinent = destinations[selectedContinent as keyof typeof destinations] || [];
        newFilteredRetreats = newFilteredRetreats.filter(retreat =>
            regionsInContinent.includes(retreat.location)
        );
    }
    if (selectedRegion && selectedRegion !== '') {
        newFilteredRetreats = newFilteredRetreats.filter(retreat =>
            retreat.location === selectedRegion
        );
    }

    // Price filter
    if (investmentRange !== 'any') {
        const { min, max } = parsePriceRange(investmentRange);
        newFilteredRetreats = newFilteredRetreats.filter(
            retreat => retreat.price >= min && retreat.price <= max
        );
    }
    
    // Timing filter is cosmetic for now as data is not available on retreats
    
    setFilteredRetreats(newFilteredRetreats);
  }, [experienceType, selectedContinent, selectedRegion, investmentRange, timing]);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !firestore) {
      toast({ variant: 'destructive', title: 'Please enter a valid email.' });
      return;
    }
    setWaitlistStatus('submitting');
    try {
      await addDoc(collection(firestore, 'waitlist_seekers'), {
        email: waitlistEmail.toLowerCase(),
        phone: waitlistPhone,
        smsOptIn: waitlistSmsOptIn,
        createdAt: serverTimestamp(),
        sourcePage: 'seeker-page',
        filtersSnapshot: {
          experienceType,
          destination: selectedContinent,
          regionCountry: selectedRegion,
          investmentRange,
          timing,
        },
        status: 'active',
      });
      setWaitlistStatus('submitted');
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      setWaitlistStatus('error');
    }
  };

  const showRegionFilter = selectedContinent && selectedContinent !== 'anywhere' && destinations[selectedContinent as keyof typeof destinations];

  const handleClearFilters = () => {
    setExperienceType('all-experiences');
    setSelectedContinent('anywhere');
    setSelectedRegion('');
    setInvestmentRange('any');
    setTiming('exploring');
    setSearchInitiated(false);
  };
  
  const handleExploreClick = () => {
    setSearchInitiated(true);
    document.getElementById('retreat-results')?.scrollIntoView({ behavior: 'smooth' });
  }

  const ManifestSection = (
    <div className="bg-secondary rounded-lg p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col">
                <h2 className="font-headline text-5xl md:text-7xl tracking-widest">MANIFEST</h2>
                <div className="mt-6 space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Have a retreat in mind? Manifest it here—and we’ll connect you with hosts, guides, and vendors who match what you’re looking for.
                    </p>
                    <div className="w-full">
                        <Button size="lg" asChild className="w-full py-7 text-lg">
                            <Link href="/seeker/manifest/new">Manifest a Retreat</Link>
                        </Button>
                    </div>
                    <div>
                        <p className="font-bold">Manifest your retreat. Earn up to $500 toward the next one.</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                            HighVibe likes to end on a high note. Once your manifested retreat is complete, you’ll receive HighVibe credit equal to 3% of your retreat booking subtotal, up to $500. Use it toward your next retreat within 12 months. Happy manifesting!
                        </p>
                    </div>
                     <div className="pt-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsHowItWorksOpen(true)}
                            className="w-full border-beige-dark text-beige-dark hover:bg-accent text-base py-6 font-medium"
                        >
                            How it works
                        </Button>
                    </div>
                </div>
            </div>
             {manifestImage && (
                <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                    <Image
                        src={manifestImage.imageUrl}
                        alt={manifestImage.description}
                        data-ai-hint={manifestImage.imageHint}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
        </div>
    </div>
  );
  
  const isFiltered =
    experienceType !== 'all-experiences' ||
    selectedContinent !== 'anywhere' ||
    selectedRegion !== '' ||
    investmentRange !== 'any' ||
    timing !== 'exploring';

  const isSearchActive = searchInitiated || isFiltered;

  return (
    <>
    <HowItWorksModal isOpen={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen} />
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
          <div className="relative text-white px-4 z-20" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            <h1 className="font-headline text-6xl md:text-7xl font-bold">Find Your Next Experience</h1>
            <p className="text-slate-100 mt-6 text-xl md:text-2xl max-w-3xl mx-auto font-body">
              Curated retreats for those who choose curiosity, connection, and living well.
            </p>
          </div>
        </div>
      )}

      <Card className="mb-8 p-4 md:p-6 bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="type">What experience are you seeking?</Label>
            <Select value={experienceType} onValueChange={setExperienceType}>
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
            <Select value={selectedContinent} onValueChange={(value) => {
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
          {showRegionFilter && (
              <div className="space-y-2">
                <Label htmlFor="region">Region / Country</Label>
                <Select onValueChange={setSelectedRegion} value={selectedRegion}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select a country or region" />
                  </SelectTrigger>
                  <SelectContent>
                    {(destinations[selectedContinent as keyof typeof destinations] || []).map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="price">Budget</Label>
            <Select value={investmentRange} onValueChange={setInvestmentRange}>
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
           <div className="space-y-2">
              <Label htmlFor="timing">Timing (When are you hoping to go?)</Label>
              <Select value={timing} onValueChange={setTiming}>
                <SelectTrigger id="timing">
                  <SelectValue placeholder="Just exploring" />
                </SelectTrigger>
                <SelectContent>
                  {timingOptions.map((timing) => (
                    <SelectItem key={timing.value} value={timing.value}>{timing.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <div className="lg:col-span-full flex flex-wrap gap-2">
            <Button size="lg" className="flex-grow" onClick={handleExploreClick}>Explore Experiences</Button>
            <Button size="lg" variant="outline" asChild><Link href="/seeker/manifestations">My Manifestations</Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/seeker/saved">View Saved</Link></Button>
            <Button size="lg" variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
          </div>
        </div>
      </Card>
      
      <div id="retreat-results" className="scroll-mt-24">
        {!isSearchActive ? (
          // STATE A: Default view
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2 font-headline">Retreats We’re Loving</h2>
              <p className="text-muted-foreground">A few favorites to get you inspired.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRetreats.map((retreat) => (
                <RetreatCard key={retreat.id} retreat={retreat} isLux={retreat.id === mostExpensiveRetreatId} />
              ))}
            </div>
            <div className="mt-24">
              {ManifestSection}
            </div>
          </>
        ) : (
          // STATE B or C: Search is active
          <>
            {filteredRetreats.length > 0 ? (
              // STATE B: Results found
              <>
                <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">{filteredRetreats.length} Matching {filteredRetreats.length === 1 ? 'Retreat' : 'Retreats'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRetreats.map((retreat) => (
                    <RetreatCard key={retreat.id} retreat={retreat} isLux={retreat.id === mostExpensiveRetreatId} />
                  ))}
                </div>
                <div className="mt-24 text-center">
                  <p className="text-2xl italic text-beige font-body mb-12">Not seeing the one? Manifest exactly what you want.</p>
                  {ManifestSection}
                </div>
              </>
            ) : (
              // STATE C: No results
              <div className="text-center mt-8">
                <h3 className="font-headline text-3xl font-bold mb-12">No matches yet.</h3>
                <p className="text-2xl italic text-beige font-body mb-12">Not seeing the one? Manifest exactly what you want.</p>
                {ManifestSection}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}
