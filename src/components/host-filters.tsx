'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { popularAmenities, otherAmenities, hostVibes, destinations, continents } from "@/lib/mock-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Switch } from './ui/switch';

export interface HostFiltersState {
  continent: string;
  region: string;
  planningWindow: string;
  flexibleDates: boolean;
  showNearMatches: boolean;
  showExactDates: boolean;
  startDate?: Date;
  endDate?: Date;
  sleepingCapacity: string;
  eventCapacity: string;
  bedrooms: string;
  bathrooms: string;
  roomStyles: string[];
  budget: number;
  amenities: string[];
  retreatReady: boolean;
  gatheringSpace: boolean;
  quietSetting: boolean;
  kitchen: string;
  policies: string[];
  vibes: string[];
}

interface HostFiltersProps {
  filters: HostFiltersState;
  onFiltersChange: (filters: Partial<HostFiltersState>) => void;
}


function FilterGroup({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <AccordionItem value={title}>
            <AccordionTrigger className="text-base font-semibold py-3">{title}</AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 pt-2">
                    {children}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

const sleepingCapacityOptions = ["6+", "10+", "14+", "18+", "24+", "30+"];
const eventCapacityOptions = ["Any", "10+", "20+", "30+", "50+", "100+"];
const bedroomOptions = ["Any", "2+", "4+", "6+", "8+", "10+"];
const bathroomOptions = ["Any", "2+", "4+", "6+", "8+"];
const roomStyleOptions = ["Private rooms available", "Shared rooms available", "Mixed (private + shared)"];
const retreatPolicies = ["Alcohol allowed", "Wellness activities allowed (yoga / sound / breathwork)", "Outdoor fires allowed (if applicable)"];

const planningWindowOptions = [
    { value: 'anytime', label: 'Anytime' },
    { value: '1-3-months', label: '1–3 months' },
    { value: '3-6-months', label: '3–6 months' },
    { value: '6-9-months', label: '6–9 months' },
    { value: '9-12-months', label: '9–12 months' },
    { value: '12-plus-months', label: '12+ months' },
];

export function HostFilters({ filters, onFiltersChange }: HostFiltersProps) {

    const handleCheckboxChange = (group: keyof HostFiltersState, item: string, checked: boolean) => {
        const currentValues = (filters[group] as string[]) || [];
        const newValues = checked
            ? [...currentValues, item]
            : currentValues.filter(v => v !== item);
        onFiltersChange({ [group]: newValues });
    };

    const CheckboxFilter = ({ item, description, group }: { item: string, description?: string, group: keyof HostFiltersState }) => {
        const id = `filter-${group}-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const isChecked = Array.isArray(filters[group]) ? (filters[group] as string[]).includes(item) : false;
        return (
            <div className="flex items-start space-x-3">
                <Checkbox 
                    id={id} 
                    className="mt-0.5"
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(group, item, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={id} className="font-normal leading-tight">{item}</Label>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
        )
    };
    
    const showRegionFilter = filters.continent && filters.continent !== 'anywhere' && destinations[filters.continent];

    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Spaces</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Location", "Availability", "Capacity & Layout", "Nightly Rate", "Amenities", "Retreat Suitability", "Vibe"]} className="w-full">
                    
                    <FilterGroup title="Location">
                        <div className="space-y-2">
                             <p className="text-xs text-muted-foreground">Start broad, then narrow. You can also choose “Anywhere”.</p>
                            <Label>Continent</Label>
                            <Select value={filters.continent} onValueChange={(value) => onFiltersChange({ continent: value, region: '' })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Anywhere" />
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
                                <Label>Country/Region</Label>
                                <Select value={filters.region} onValueChange={(value) => onFiltersChange({ region: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Country/Region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(destinations[filters.continent] || []).map(region => (
                                            <SelectItem key={region} value={region}>{region}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </FilterGroup>

                    <FilterGroup title="Availability">
                        <div className="space-y-2">
                            <Label>Planning Window</Label>
                            <Select value={filters.planningWindow} onValueChange={(value) => onFiltersChange({ planningWindow: value })}>
                                <SelectTrigger>
                                <SelectValue placeholder="Anytime" />
                                </SelectTrigger>
                                <SelectContent>
                                {planningWindowOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground pt-1">
                                Most retreats are planned months in advance. Choose a general
                                timeframe to see spaces that fit your planning window.
                            </p>
                        </div>
                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox id="flexible-dates-host" checked={filters.flexibleDates} onCheckedChange={(checked) => onFiltersChange({ flexibleDates: !!checked })} />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="flexible-dates-host" className="font-normal">My dates are flexible</Label>
                                <p className="text-xs text-muted-foreground">Helpful if you’re choosing the location first and locking dates second.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 pt-2">
                            <Switch id="near-matches-toggle" checked={filters.showNearMatches} onCheckedChange={(checked) => onFiltersChange({ showNearMatches: checked })} className="mt-0.5" />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="near-matches-toggle" className="font-normal">Show near matches</Label>
                                <p className="text-xs text-muted-foreground">We’ll include spaces that are close to your ideal window.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <Switch id="exact-dates-toggle" checked={filters.showExactDates} onCheckedChange={(checked) => onFiltersChange({ showExactDates: checked })} className="mt-0.5" />
                            <Label htmlFor="exact-dates-toggle" className="font-normal">I have exact dates (optional)</Label>
                        </div>

                        {filters.showExactDates && (
                            <div className="space-y-4 pt-4 mt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="start-date"
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !filters.startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filters.startDate ? format(filters.startDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={filters.startDate}
                                                onSelect={(date) => onFiltersChange({ startDate: date })}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="end-date"
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !filters.endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filters.endDate ? format(filters.endDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={filters.endDate}
                                                onSelect={(date) => onFiltersChange({ endDate: date })}
                                                disabled={(date) =>
                                                    filters.startDate ? date < filters.startDate : false
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}
                    </FilterGroup>

                    <FilterGroup title="Capacity & Layout">
                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground">Some spaces sleep fewer than they can host for daytime sessions.</p>
                            <div className="space-y-2">
                                <Label>Sleeping capacity (guests)</Label>
                                <Select value={filters.sleepingCapacity} onValueChange={(value) => onFiltersChange({ sleepingCapacity: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any capacity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any capacity</SelectItem>
                                        {sleepingCapacityOptions.map(option => (
                                            <SelectItem key={option} value={option.replace('+', '')}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Beds/rooms available overnight.</p>
                            </div>
                             <div className="space-y-2">
                                <Label>Event capacity (day use)</Label>
                                <Select value={filters.eventCapacity} onValueChange={(value) => onFiltersChange({ eventCapacity: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any capacity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any capacity</SelectItem>
                                        {eventCapacityOptions.map(option => (
                                            <SelectItem key={option} value={option === 'Any' ? 'any' : option.replace('+', '')}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Max people for workshops/dining, including off-site lodging.</p>
                            </div>
                             <div className="space-y-2">
                                <Label>Bedrooms</Label>
                                <Select value={filters.bedrooms} onValueChange={(value) => onFiltersChange({ bedrooms: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bedroomOptions.map(option => (
                                            <SelectItem key={option} value={option === 'Any' ? 'any' : option.replace('+', '')}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Bathrooms</Label>
                                <Select value={filters.bathrooms} onValueChange={(value) => onFiltersChange({ bathrooms: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bathroomOptions.map(option => (
                                            <SelectItem key={option} value={option === 'Any' ? 'any' : option.replace('+', '')}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3 pt-2">
                                <Label>Room Style</Label>
                                {roomStyleOptions.map(item => <CheckboxFilter key={item} item={item} group="roomStyles" />)}
                            </div>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Nightly Rate">
                        <div className="space-y-4 px-1 pt-2">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-foreground font-medium">Up to ${filters.budget.toLocaleString()}{filters.budget >= 20000 ? '+' : ''} / night</p>
                            </div>
                            <div className="py-3">
                                <Slider
                                    value={[filters.budget]}
                                    onValueChange={(value) => onFiltersChange({ budget: value[0]})}
                                    max={20000}
                                    step={100}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground -mt-2">
                                <span>$0 / night</span>
                                <span>$20,000+</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-1">
                                We’ll show spaces at or below this nightly rate.
                            </p>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Amenities">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Popular</h4>
                            <div className="space-y-3">
                                {popularAmenities.map(type => <CheckboxFilter key={type} item={type} group="amenities" />)}
                            </div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <h4 className="font-semibold text-sm">Other</h4>
                            <div className="space-y-3">
                                {otherAmenities.map(amenity => <CheckboxFilter key={amenity} item={amenity} group="amenities" />)}
                            </div>
                        </div>
                    </FilterGroup>
                    
                    <FilterGroup title="Retreat Suitability">
                        <div className="space-y-4">
                             <div className="flex items-start space-x-3">
                                <Checkbox id="retreat-ready" className="mt-0.5" checked={filters.retreatReady} onCheckedChange={(checked) => onFiltersChange({ retreatReady: !!checked })}/>
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="retreat-ready" className="font-normal">Retreat-ready spaces</Label>
                                    <p className="text-xs text-muted-foreground">Spaces that explicitly support retreats, workshops, and group experiences.</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-3">
                                <Checkbox id="gathering-space" className="mt-0.5" checked={filters.gatheringSpace} onCheckedChange={(checked) => onFiltersChange({ gatheringSpace: !!checked })}/>
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="gathering-space" className="font-normal">Dedicated gathering space</Label>
                                    <p className="text-xs text-muted-foreground">Indoor or covered space suitable for group sessions.</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-3">
                                <Checkbox id="quiet-setting" className="mt-0.5" checked={filters.quietSetting} onCheckedChange={(checked) => onFiltersChange({ quietSetting: !!checked })}/>
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="quiet-setting" className="font-normal">Quiet setting</Label>
                                    <p className="text-xs text-muted-foreground">Good for meditation, rest, and low-noise evenings.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Kitchen + meal-friendly</Label>
                                <Select value={filters.kitchen} onValueChange={(value) => onFiltersChange({ kitchen: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any</SelectItem>
                                        <SelectItem value="full">Full kitchen onsite</SelectItem>
                                        <SelectItem value="commercial">Commercial kitchen</SelectItem>
                                        <SelectItem value="catering">Catering allowed</SelectItem>
                                        <SelectItem value="chef">Private chef allowed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3 pt-2">
                                <Label>Retreat policies</Label>
                                {retreatPolicies.map(item => <CheckboxFilter key={item} item={item} group="policies" />)}
                            </div>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Vibe">
                        <div className="space-y-4">
                            {hostVibes.map(vibe => <CheckboxFilter key={vibe.name} item={vibe.name} description={vibe.description} group="vibes" />)}
                            <p className="text-xs text-muted-foreground pt-1">Vibe helps us match aesthetics and energy—select all that fit.</p>
                        </div>
                    </FilterGroup>
                </Accordion>
            </CardContent>
        </Card>
    )
}
