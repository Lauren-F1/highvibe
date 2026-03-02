'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, CheckCircle, MapPin, Star, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ScoutedVendor } from '@/ai/flows/scout-local-vendors';

const vendorCategories = [
  'Catering',
  'Photography',
  'Videography',
  'Yoga Instructor',
  'Massage Therapist',
  'Sound Healer',
  'Transportation',
  'Event Planner',
  'Florist',
  'Live Music',
];

interface ScoutVendorsProps {
  retreatLocation?: string;
  retreatDescription?: string;
  guideUserId: string;
  retreatId?: string;
}

export function ScoutVendors({ retreatLocation, retreatDescription, guideUserId, retreatId }: ScoutVendorsProps) {
  const [location, setLocation] = useState(retreatLocation || '');
  const [category, setCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ScoutedVendor[]>([]);
  const [searchSummary, setSearchSummary] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [sendingTo, setSendingTo] = useState<Set<string>>(new Set());
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!location || !category) {
      toast({ title: 'Please fill in both fields', variant: 'destructive' });
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSearchSummary('');

    try {
      const response = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, category, retreatDescription }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Scout search failed');
      }

      const data = await response.json();
      setResults(data.vendors);
      setSearchSummary(data.searchSummary);
    } catch (error: any) {
      toast({ title: 'Search failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleReachOut = async (vendor: ScoutedVendor) => {
    setSendingTo(prev => new Set(prev).add(vendor.email));

    try {
      const response = await fetch('/api/scout/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorEmail: vendor.email,
          vendorName: vendor.name,
          vendorCategory: category,
          location,
          guideUserId,
          retreatId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send outreach');
      }

      setSentTo(prev => new Set(prev).add(vendor.email));
      toast({
        title: 'Outreach sent!',
        description: `We've reached out to ${vendor.name} on your behalf. They'll be invited to join HighVibe.`,
      });
    } catch (error: any) {
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' });
    } finally {
      setSendingTo(prev => {
        const next = new Set(prev);
        next.delete(vendor.email);
        return next;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Search className="h-5 w-5" />
          Scout Local Vendors
        </CardTitle>
        <CardDescription className="font-body">
          Find local service providers for your retreat. We'll search for businesses in the area and reach out on your behalf — they won't know who you are until they join the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="scout-location">Location</Label>
            <Input
              id="scout-location"
              placeholder="e.g., Ubud, Bali"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scout-category">Service Type</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="scout-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {vendorCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !location || !category} size="lg">
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scout Vendors
              </>
            )}
          </Button>
        </div>

        {/* Search Summary */}
        {searchSummary && (
          <p className="text-sm text-muted-foreground">{searchSummary}</p>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-headline text-lg">Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((vendor) => (
                <Card key={vendor.email} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 mt-1">
                        {vendor.photoUrl ? (
                          <AvatarImage src={vendor.photoUrl} alt={vendor.name} />
                        ) : null}
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{vendor.name}</h4>
                          <Badge variant={vendor.relevanceScore >= 70 ? 'default' : 'secondary'}>
                            {vendor.relevanceScore}% match
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{vendor.address}</span>
                        </div>
                        {vendor.rating && (
                          <div className="flex items-center text-sm mt-1">
                            <Star className="mr-1 h-3 w-3 text-primary fill-primary" />
                            <span>{vendor.rating}/5</span>
                            {vendor.reviewCount && (
                              <span className="text-muted-foreground ml-1">({vendor.reviewCount} reviews)</span>
                            )}
                          </div>
                        )}
                        {vendor.website && (
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Globe className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{vendor.website}</span>
                          </div>
                        )}
                        <p className="text-sm mt-2 text-muted-foreground">{vendor.relevanceReason}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {sentTo.has(vendor.email) ? (
                      <Button className="w-full" variant="outline" disabled>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Outreach Sent
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleReachOut(vendor)}
                        disabled={sendingTo.has(vendor.email)}
                      >
                        {sendingTo.has(vendor.email) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Reach Out on My Behalf
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {hasSearched && results.length === 0 && !isSearching && (
          <div className="text-center py-8 rounded-lg bg-secondary/50">
            <p className="text-muted-foreground">No vendors found with contact info in this area. Try a different location or category.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
