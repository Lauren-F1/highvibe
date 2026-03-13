'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, CheckCircle, MapPin, Star, Globe, Loader2, Building2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import type { ScoutedHost } from '@/ai/flows/scout-local-hosts';

const accommodationTypes = [
  'Boutique Hotel',
  'Resort',
  'Villa',
  'Eco-Lodge',
  'Retreat Center',
  'Bed & Breakfast',
  'Estate',
  'Ranch',
  'Glamping Site',
];

interface ScoutHostsProps {
  retreatLocation?: string;
  retreatDescription?: string;
  guideUserId: string;
  retreatId?: string;
  groupSize?: number;
}

export function ScoutHosts({ retreatLocation, retreatDescription, guideUserId, retreatId, groupSize: initialGroupSize }: ScoutHostsProps) {
  const [location, setLocation] = useState(retreatLocation || '');
  const [accommodationType, setAccommodationType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ScoutedHost[]>([]);
  const [searchSummary, setSearchSummary] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [sendingTo, setSendingTo] = useState<Set<string>>(new Set());
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const user = useUser();

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await (user.data as any)?.getIdToken?.();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  };

  const handleSearch = async () => {
    if (!location || !accommodationType) {
      toast({ title: 'Please fill in both fields', variant: 'destructive' });
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSearchSummary('');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/scout/hosts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ location, accommodationType, retreatDescription, groupSize: initialGroupSize }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Host scout search failed');
      }

      const data = await response.json();
      setResults(data.hosts);
      setSearchSummary(data.searchSummary);
    } catch (error: any) {
      toast({ title: 'Search failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleReachOut = async (host: ScoutedHost) => {
    setSendingTo(prev => new Set(prev).add(host.email));

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/scout/host-outreach', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          hostEmail: host.email,
          hostName: host.name,
          accommodationType,
          location,
          retreatId,
          groupSize: initialGroupSize,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send outreach');
      }

      setSentTo(prev => new Set(prev).add(host.email));
      toast({
        title: 'Outreach sent!',
        description: `We've reached out to ${host.name} on your behalf. They'll be invited to list their property on HighVibe.`,
      });
    } catch (error: any) {
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' });
    } finally {
      setSendingTo(prev => {
        const next = new Set(prev);
        next.delete(host.email);
        return next;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Scout Host Properties
        </CardTitle>
        <CardDescription className="font-body">
          Find boutique hotels, resorts, and unique properties to host your retreat. We'll reach out on your behalf with a partnership proposal — they won't know who you are until they join.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="host-scout-location">Location</Label>
            <Input
              id="host-scout-location"
              placeholder="e.g., Tulum, Mexico"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="host-scout-type">Property Type</Label>
            <Select value={accommodationType} onValueChange={setAccommodationType}>
              <SelectTrigger id="host-scout-type">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {accommodationTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !location || !accommodationType} size="lg">
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scout Properties
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
              {results.map((host) => (
                <Card key={host.email} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 mt-1">
                        {host.photoUrl ? (
                          <AvatarImage src={host.photoUrl} alt={host.name} />
                        ) : null}
                        <AvatarFallback><Building2 className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{host.name}</h4>
                          <Badge variant={host.relevanceScore >= 70 ? 'default' : 'secondary'}>
                            {host.relevanceScore}% match
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{host.address}</span>
                        </div>
                        {host.rating && (
                          <div className="flex items-center text-sm mt-1">
                            <Star className="mr-1 h-3 w-3 text-primary fill-primary" />
                            <span>{host.rating}/5</span>
                            {host.reviewCount && (
                              <span className="text-muted-foreground ml-1">({host.reviewCount} reviews)</span>
                            )}
                          </div>
                        )}
                        {host.estimatedCapacity && (
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Users className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span>{host.estimatedCapacity}</span>
                          </div>
                        )}
                        {host.website && (
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Globe className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{host.website}</span>
                          </div>
                        )}
                        <p className="text-sm mt-2 text-muted-foreground">{host.relevanceReason}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {sentTo.has(host.email) ? (
                      <Button className="w-full" variant="outline" disabled>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Outreach Sent
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleReachOut(host)}
                        disabled={sendingTo.has(host.email)}
                      >
                        {sendingTo.has(host.email) ? (
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
            <p className="text-muted-foreground">No properties found with contact info in this area. Try a different location or property type.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
