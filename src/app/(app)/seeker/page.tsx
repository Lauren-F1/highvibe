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
  { value: '3-months', label: 'Within 3 months' },
  { value: '6-months', label: 'Within 6 months' },
  { value: '12-months', label: 'Within 12 months' },
  { value: 'exploring', label: 'Just exploring' }
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
        const regionsInContinent = destinations[selectedContinent] || [];
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

  const showRegionFilter = selectedContinent && selectedContinent !== 'anywhere' && destinations[selectedContinent];

  const handleClearFilters = () => {
    setExperienceType('all-experiences');
    setSelectedContinent('anywhere');
    setSelectedRegion('');
    setInvestmentRange('any');
    setTiming('exploring');
  };
  
  const handleExploreClick = () => {
    document.getElementById('retreat-results')?.scrollIntoView({ behavior: 'smooth' });
  }

  const renderWaitlistCard = () => {
    switch (waitlistStatus) {
      case 'submitted':
        return (
          <Card className="mt-8 text-left bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-2xl">You’re on the list.</CardTitle>
              <CardDescription>
                We’ll notify you when experiences like this become available.
              </CardDescription>
            </CardHeader>
          </Card>
        );
      case 'idle':
      case 'submitting':
      case 'error':
      default:
        return (
          <form onSubmit={handleWaitlistSubmit}>
            <Card className="mt-8 text-left bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-2xl">Get notified when aligned retreats become available</CardTitle>
                <CardDescription>
                  We’ll only reach out when something matches what you’re looking for. No spam. No noise.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {waitlistStatus === 'error' && (
                  <p className="text-destructive text-sm">Something didn’t go through — please try again.</p>
                 )}
                <div className="space-y-2">
                  <Label htmlFor="email-notify">Email Address</Label>
                  <Input
                    id="email-notify"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    disabled={waitlistStatus === 'submitting'}
                  />
                  <p className="text-xs text-muted-foreground pt-1">No spam. Just aligned retreats when they’re ready.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-notify">Phone Number (optional)</Label>
                  <Input
                    id="phone-notify"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={waitlistPhone}
                    onChange={(e) => setWaitlistPhone(e.target.value)}
                    disabled={waitlistStatus === 'submitting'}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms-notify"
                    checked={waitlistSmsOptIn}
                    onCheckedChange={(checked) => setWaitlistSmsOptIn(Boolean(checked))}
                    disabled={waitlistStatus === 'submitting'}
                  />
                  <Label htmlFor="sms-notify" className="text-sm font-normal leading-none">
                    Text me when new retreats match my preferences
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" size="lg" disabled={waitlistStatus === 'submitting'}>
                  {waitlistStatus === 'submitting' ? 'Submitting...' : 'Notify Me When It’s Available'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        );
    }
  };

  const ManifestSection = (
    <div className="mb-12 bg-secondary rounded-lg p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-8">
                <h2 className="font-headline text-5xl md:text-7xl tracking-widest">MANIFEST</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Have a retreat in mind? Manifest it here—and we’ll connect you with hosts, guides, and vendors who match what you’re looking for.
                </p>
                <div className="flex items-center gap-4">
                    <Button size="lg" asChild className="px-10 py-7 text-lg">
                        <Link href="/seeker/manifest/new">Manifest a Retreat</Link>
                    </Button>
                </div>
                 <div className="space-y-2 pt-4">
                    <p className="font-bold">Manifest your retreat. Earn up to $500 toward the next one.</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        HighVibe likes to end on a high note. Once your manifested retreat is complete, you’ll receive HighVibe credit equal to 3% of your retreat booking subtotal, up to $500. Use it toward your next retreat within 12 months. Happy manifesting!
                    </p>
                 </div>
                 <div className="pt-6">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsHowItWorksOpen(true)}
                        className="border-beige-dark text-beige-dark hover:bg-accent"
                    >
                        How it works
                    </Button>
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

  return (
    <>
    <HowItWorksModal isOpen={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen} />
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
                    {(destinations[selectedContinent] || []).map(region => (
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
        {filteredRetreats.length > 0 ? (
          <>
            <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">{filteredRetreats.length} Matching {filteredRetreats.length === 1 ? 'Retreat' : 'Retreats'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRetreats.map((retreat) => (
                <RetreatCard key={retreat.id} retreat={retreat} isLux={retreat.id === mostExpensiveRetreatId} />
              ))}
            </div>
            <div className="mt-16 text-center">
                <p className="text-lg text-muted-foreground font-body mb-8">Not seeing the one? Manifest exactly what you want.</p>
                {ManifestSection}
            </div>
          </>
        ) : (
           <>
            {ManifestSection}
            <div className="text-center py-16 max-w-2xl mx-auto">
                <h3 className="font-headline text-3xl font-bold">No matches yet.</h3>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                    Want to broaden your search—or manifest exactly what you’re looking for?
                </p>
                {renderWaitlistCard()}
            </div>
           </>
        )}
      </div>
    </div>
    </>
  );
}
