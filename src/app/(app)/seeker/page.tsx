
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RetreatCard } from '@/components/retreat-card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { HowItWorksModal } from '@/components/how-it-works-modal';
import { allRetreats as mockRetreats, continents, destinations, experienceTypes, investmentRanges, timingOptions } from '@/lib/mock-data';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Search, Map, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { RetreatMap } from '@/components/retreat-map-wrapper';
import { getCoordinatesForLocation } from '@/lib/geocode';

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
  const heroImage = '/desert-retreat.png';
  const manifestImage = '/lux-jungle.png';
  
  // Filter states
  const [experienceType, setExperienceType] = useState('all-experiences');
  const [selectedContinent, setSelectedContinent] = useState('anywhere');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [investmentRange, setInvestmentRange] = useState('any');
  const [timing, setTiming] = useState('exploring');
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>();
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'best-match'>('default');

  // Firestore retreats loading
  const [firestoreRetreats, setFirestoreRetreats] = useState<typeof mockRetreats>([]);
  const [retreatsLoaded, setRetreatsLoaded] = useState(false);

  const retreats = useMemo(() =>
    retreatsLoaded && firestoreRetreats.length > 0
      ? [...firestoreRetreats, ...mockRetreats]
      : mockRetreats,
    [retreatsLoaded, firestoreRetreats]
  );

  const [filteredRetreats, setFilteredRetreats] = useState(mockRetreats);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const mostExpensiveRetreatId = retreats.length > 0 ? retreats.reduce((prev, current) => (prev.price > current.price) ? prev : current).id : '';

  // Waitlist form state
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistSmsOptIn, setWaitlistSmsOptIn] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // Load published retreats from Firestore
  useEffect(() => {
    if (!firestore || !user?.uid) return;

    const loadRetreats = async () => {
      try {
        const { getDocs, query, where } = await import('firebase/firestore');
        const retreatsRef = collection(firestore, 'retreats');
        const q = query(retreatsRef, where('status', '==', 'published'));
        const snapshot = await getDocs(q);
        const loaded = snapshot.docs.map(d => {
          const data = d.data();
          const coords = (data.lat && data.lng)
            ? { lat: data.lat as number, lng: data.lng as number }
            : getCoordinatesForLocation(data.locationDescription || '');
          return {
            id: d.id,
            title: data.title || '',
            description: data.description || '',
            location: data.locationDescription || '',
            price: data.costPerPerson || 0,
            rating: 0,
            image: data.retreatImageUrls?.[0] || '/generic-placeholder.png',
            type: data.type ? [data.type.toLowerCase().replace(/\s+/g, '-')] : [],
            duration: data.startDate && data.endDate ? `${data.startDate} to ${data.endDate}` : undefined,
            startDate: (data.startDate as string) || undefined,
            endDate: (data.endDate as string) || undefined,
            included: data.included || undefined,
            lat: coords?.lat,
            lng: coords?.lng,
            isFullyBooked: data.currentAttendees != null && data.capacity != null && data.currentAttendees >= data.capacity,
          };
        });
        setFirestoreRetreats(loaded);
      } catch (error) {
        console.error('Error loading retreats:', error);
      } finally {
        setRetreatsLoaded(true);
      }
    };

    loadRetreats();
  }, [firestore, user?.uid]);

  useEffect(() => {
    // This effect is only for filtering, not for deciding which state to show
    if (!searchInitiated) {
        setFilteredRetreats(retreats);
        return;
    }

    let newFilteredRetreats = [...retreats];

    // Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      newFilteredRetreats = newFilteredRetreats.filter(retreat =>
        (retreat.title || '').toLowerCase().includes(q) ||
        (retreat.location || '').toLowerCase().includes(q) ||
        (retreat.description || '').toLowerCase().includes(q)
      );
    }

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
            retreat.location && regionsInContinent.includes(retreat.location)
        );
    }
    if (selectedRegion && selectedRegion !== '') {
        newFilteredRetreats = newFilteredRetreats.filter(retreat =>
            retreat.location && retreat.location === selectedRegion
        );
    }

    // Price filter
    if (investmentRange !== 'any') {
        const { min, max } = parsePriceRange(investmentRange);
        newFilteredRetreats = newFilteredRetreats.filter(
            retreat => retreat.price >= min && retreat.price <= max
        );
    }
    
    // Date range filter — only applies to Firestore retreats with startDate/endDate
    if (filterStartDate) {
      newFilteredRetreats = newFilteredRetreats.filter(retreat => {
        const r = retreat as typeof retreat & { startDate?: string; endDate?: string };
        if (!r.startDate) return true; // Mock retreats without dates pass through
        const retreatStart = parseISO(r.startDate);
        // Retreat must start on or after the filter start date
        return !isBefore(retreatStart, filterStartDate);
      });
    }
    if (filterEndDate) {
      newFilteredRetreats = newFilteredRetreats.filter(retreat => {
        const r = retreat as typeof retreat & { startDate?: string; endDate?: string };
        if (!r.endDate) return true; // Mock retreats without dates pass through
        const retreatEnd = parseISO(r.endDate);
        // Retreat must end on or before the filter end date
        return !isAfter(retreatEnd, filterEndDate);
      });
    }

    // Timing filter — narrows by how soon the retreat starts
    if (timing !== 'exploring') {
      const now = new Date();
      const monthsMap: Record<string, number> = {
        'next-month': 1,
        'next-3-months': 3,
        'next-6-months': 6,
        'next-year': 12,
      };
      const months = monthsMap[timing];
      if (months) {
        const cutoff = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
        newFilteredRetreats = newFilteredRetreats.filter(retreat => {
          const r = retreat as typeof retreat & { startDate?: string };
          if (!r.startDate) return true; // Mock retreats without dates pass through
          const retreatStart = parseISO(r.startDate);
          return !isAfter(retreatStart, cutoff);
        });
      }
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      newFilteredRetreats.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      newFilteredRetreats.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'best-match') {
      // Simple relevance: retreats matching more selected filters score higher
      newFilteredRetreats.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (experienceType !== 'all-experiences') {
          if (a.type?.includes(experienceType)) scoreA += 30;
          if (b.type?.includes(experienceType)) scoreB += 30;
        }
        // Prefer retreats with more type overlap
        if (a.type) scoreA += a.type.length * 5;
        if (b.type) scoreB += b.type.length * 5;
        // Prefer mid-range pricing (closer to median)
        const median = retreats.reduce((s, r) => s + r.price, 0) / Math.max(retreats.length, 1);
        if (median > 0) {
          scoreA += Math.max(0, 20 - Math.abs(a.price - median) / median * 10);
          scoreB += Math.max(0, 20 - Math.abs(b.price - median) / median * 10);
        }
        return scoreB - scoreA;
      });
    }

    setFilteredRetreats(newFilteredRetreats);
  }, [experienceType, selectedContinent, selectedRegion, investmentRange, timing, searchInitiated, searchQuery, retreats, filterStartDate, filterEndDate, sortBy]);

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

  const showRegionFilter = selectedContinent && selectedContinent !== 'anywhere' && destinations[selectedContinent ];
  
  const isFilterActive =
    experienceType !== 'all-experiences' ||
    selectedContinent !== 'anywhere' ||
    selectedRegion !== '' ||
    investmentRange !== 'any' ||
    timing !== 'exploring' ||
    searchQuery.trim() !== '' ||
    !!filterStartDate ||
    !!filterEndDate;

  const handleClearFilters = () => {
    setExperienceType('all-experiences');
    setSelectedContinent('anywhere');
    setSelectedRegion('');
    setInvestmentRange('any');
    setTiming('exploring');
    setSearchQuery('');
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    setSearchInitiated(false);
  };
  
  const handleExploreClick = () => {
    setSearchInitiated(true);
    document.getElementById('retreat-results')?.scrollIntoView({ behavior: 'smooth' });
  }

  const headlineStyle: CSSProperties = {
    textShadow: '0 2px 10px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.35)',
  };
  
  const subheadlineStyle: CSSProperties = {
    textShadow: '0 2px 10px rgba(0,0,0,0.40)',
  };


  const RetreatMapView = ({ retreats: mapRetreats }: { retreats: typeof filteredRetreats }) => {
    const mappable = mapRetreats
      .filter((r): r is typeof r & { lat: number; lng: number } => r.lat != null && r.lng != null)
      .map(r => ({ id: r.id, title: r.title, price: r.price, lat: r.lat, lng: r.lng }));
    const hiddenCount = mapRetreats.length - mappable.length;

    if (mappable.length === 0) {
      return (
        <div className="h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-lg bg-secondary flex items-center justify-center">
          <p className="text-muted-foreground font-body">No retreats with map coordinates available. Try the grid view.</p>
        </div>
      );
    }

    return (
      <>
        <RetreatMap retreats={mappable} />
        {hiddenCount > 0 && (
          <p className="text-sm text-muted-foreground mt-2 font-ui">
            {hiddenCount} retreat{hiddenCount !== 1 ? 's' : ''} not shown on map (missing location data).
          </p>
        )}
      </>
    );
  };

  const ManifestSection = (
    <div className="my-24">
      <div className="bg-secondary rounded-lg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md text-center lg:text-left">
                <div className="lg:w-full lg:text-center">
                  <h2 className="font-headline text-4xl sm:text-5xl md:text-7xl tracking-[0.15em] sm:tracking-[0.3em] text-center lg:w-full lg:mx-auto">MANIFEST</h2>
                </div>
                <div className="space-y-6 mt-8">
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body">
                    Have a retreat in mind? Manifest it here—and we'll connect you with hosts, guides, and vendors who match what you're looking for.
                  </p>
                  <Button size="lg" asChild className="w-full py-7 text-lg font-ui">
                    <Link href="/seeker/manifest/new">Manifest a Retreat</Link>
                  </Button>
                  <p className="text-xl md:text-2xl font-bold leading-relaxed font-body">Manifest your retreat. Earn up to $500 toward the next one.</p>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-body">
                    HighVibe likes to end on a high note. Once your manifested retreat is complete, you'll receive HighVibe credit equal to 3% of your retreat booking subtotal, up to $500. Use it toward your next retreat within 12 months. Happy manifesting!
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsHowItWorksOpen(true)}
                      className="w-full border-beige-dark text-beige-dark hover:bg-accent text-base py-6 font-medium font-ui"
                    >
                      How it works
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            {manifestImage && (
              <div className="relative w-full h-[560px] rounded-2xl overflow-hidden hidden lg:block">
                <Image
                  src={manifestImage}
                  alt={'Hot air balloons over a unique landscape'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
    <HowItWorksModal isOpen={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen} />
    <div className="container mx-auto px-4 py-8 md:py-12">
      {heroImage && (
        <div className="relative mb-8 w-full aspect-[21/9] rounded-lg overflow-hidden flex items-center justify-center text-center">
          <Image
            src={heroImage}
            alt={'A person on a boat on a serene lake'}
            fill
            className="object-cover"
            priority
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/4 pointer-events-none" 
            style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 100%)'}}
          ></div>
          <div className="relative z-10 p-4">
            <h1 className="font-headline text-3xl sm:text-5xl md:text-[4.5rem] lg:text-8xl leading-none font-bold text-white" style={headlineStyle}>Find Your Next Experience</h1>
            <p 
              className="mt-6 text-xl md:text-2xl mx-auto font-body text-white lg:whitespace-nowrap"
              style={subheadlineStyle}
            >
              Curated retreats for those who choose curiosity, connection, and living well.
            </p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search retreats by name, location, or keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) setSearchInitiated(true);
            }}
            className="pl-10 py-6 text-lg font-body"
          />
        </div>
      </div>

      <Card className="mb-8 p-4 md:p-6 bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="type" className="font-ui">What experience are you seeking?</Label>
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
            <Label htmlFor="destination" className="font-ui">Destination</Label>
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
                <Label htmlFor="region" className="font-ui">Region / Country</Label>
                <Select onValueChange={setSelectedRegion} value={selectedRegion}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select a country or region" />
                  </SelectTrigger>
                  <SelectContent>
                    {(destinations[selectedContinent ] || []).map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="price" className="font-ui">Budget</Label>
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
              <Label htmlFor="timing" className="font-ui">Timing (When are you hoping to go?)</Label>
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
            <div className="space-y-2">
              <Label className="font-ui">Date Range (optional)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filterStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterStartDate ? format(filterStartDate, "MMM d, yyyy") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterStartDate}
                      onSelect={setFilterStartDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filterEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterEndDate ? format(filterEndDate, "MMM d, yyyy") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterEndDate}
                      onSelect={setFilterEndDate}
                      disabled={(date) =>
                        filterStartDate ? date < filterStartDate : date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          <div className="space-y-2">
            <Label className="font-ui">Sort By</Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="best-match">Best Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-full flex flex-wrap gap-2">
            <Button size="lg" className="flex-grow font-ui" onClick={handleExploreClick}>Explore Experiences</Button>
            <Button size="lg" variant="outline" asChild className="font-ui"><Link href="/seeker/manifestations">My Manifestations</Link></Button>
            <Button size="lg" variant="outline" asChild className="font-ui"><Link href="/seeker/saved">View Saved</Link></Button>
            {isFilterActive && <Button size="lg" variant="outline" onClick={handleClearFilters} className="font-ui">Clear Filters</Button>}
            <div className="flex gap-1 border rounded-md p-1 ml-auto">
              <Button size="sm" variant={viewMode === 'grid' ? 'default' : 'ghost'} onClick={() => setViewMode('grid')} aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={viewMode === 'map' ? 'default' : 'ghost'} onClick={() => setViewMode('map')} aria-label="Map view">
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <div id="retreat-results" className="scroll-mt-24">
        {!searchInitiated && !isFilterActive ? (
          // STATE A: Default view
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2 font-headline">Retreats We're Loving</h2>
              <p className="text-muted-foreground font-body">A few favorites to get you inspired.</p>
            </div>
            {viewMode === 'map' ? (
              <RetreatMapView retreats={filteredRetreats} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRetreats.map((retreat) => (
                  <RetreatCard key={retreat.id} retreat={retreat} isLux={retreat.id === mostExpensiveRetreatId} />
                ))}
              </div>
            )}
            <div className="my-24">
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
                {viewMode === 'map' ? (
                  <RetreatMapView retreats={filteredRetreats} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRetreats.map((retreat) => (
                      <RetreatCard key={retreat.id} retreat={retreat} isLux={retreat.id === mostExpensiveRetreatId} />
                    ))}
                  </div>
                )}
                 <div className="my-24">
                    <p className="text-center text-2xl italic text-beige font-body my-12">Not seeing the one? Manifest exactly what you want.</p>
                    {ManifestSection}
                 </div>
              </>
            ) : (
              // STATE C: No results
              <>
                <div className="text-center mt-8">
                  <h3 className="font-headline text-3xl font-bold mb-4">No matches yet.</h3>
                </div>
                 <div className="my-24">
                    <p className="text-center text-2xl italic text-beige font-body my-12">Not seeing the one? Manifest exactly what you want.</p>
                    {ManifestSection}
                 </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}

    