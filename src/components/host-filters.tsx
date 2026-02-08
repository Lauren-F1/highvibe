

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

function CheckboxFilter({ item, description }: { item: string, description?: string }) {
    const id = `filter-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    return (
        <div className="flex items-start space-x-3">
            <Checkbox id={id} className="mt-0.5" />
            <div className="grid gap-1.5 leading-none">
                <Label htmlFor={id} className="font-normal leading-tight">{item}</Label>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
        </div>
    )
}

const sleepingCapacityOptions = ["6+", "10+", "14+", "18+", "24+", "30+"];
const eventCapacityOptions = ["Any", "10+", "20+", "30+", "50+", "100+"];
const bedroomOptions = ["Any", "2+", "4+", "6+", "8+", "10+"];
const bathroomOptions = ["Any", "2+", "4+", "6+", "8+"];
const roomStyleOptions = ["Private rooms available", "Shared rooms available", "Mixed (private + shared)"];
const retreatPolicies = ["Alcohol allowed", "Wellness activities allowed (yoga / sound / breathwork)", "Outdoor fires allowed (if applicable)"];


export function HostFilters() {
    const [startDate, setStartDate] = React.useState<Date>();
    const [endDate, setEndDate] = React.useState<Date>();
    const [showExactDates, setShowExactDates] = React.useState(false);
    const [budget, setBudget] = React.useState(20000);
    const [selectedContinent, setSelectedContinent] = React.useState('anywhere');
    const [showNearMatches, setShowNearMatches] = React.useState(false);

    const showRegionFilter = selectedContinent && selectedContinent !== 'anywhere' && destinations[selectedContinent];

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
                            <Select defaultValue="anywhere" onValueChange={setSelectedContinent}>
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
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Country/Region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(destinations[selectedContinent] || []).map(region => (
                                            <SelectItem key={region} value={region.toLowerCase().replace(/\s/g, '-')}>{region}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </FilterGroup>

                    <FilterGroup title="Availability">
                         <div className="space-y-2">
                            <Label>Planning Window</Label>
                            <Select defaultValue="anytime">
                                <SelectTrigger>
                                    <SelectValue placeholder="Anytime" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="anytime">Anytime</SelectItem>
                                    <SelectItem value="1-3-months">Next 1–3 months</SelectItem>
                                    <SelectItem value="3-6-months">3–6 months</SelectItem>
                                    <SelectItem value="6-12-months">6–12 months</SelectItem>
                                    <SelectItem value="12-plus-months">12+ months (Long-range planning)</SelectItem>
                                </SelectContent>
                            </Select>
                             <p className="text-xs text-muted-foreground pt-1">Most retreats are planned months in advance. Choose a general timeframe to see spaces and collaborators that fit your planning window. You can confirm exact dates directly with hosts and vendors.</p>
                        </div>
                        <div className="flex items-start space-x-3 pt-2">
                            <Switch id="near-matches-toggle" onCheckedChange={setShowNearMatches} checked={showNearMatches} className="mt-0.5" />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="near-matches-toggle" className="font-normal">Show near matches</Label>
                                <p className="text-xs text-muted-foreground">We’ll also show options that are close to your planning window if exact matches are limited.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <Switch id="exact-dates-toggle" onCheckedChange={setShowExactDates} checked={showExactDates} className="mt-0.5" />
                            <Label htmlFor="exact-dates-toggle" className="font-normal">I have exact dates (optional)</Label>
                        </div>

                        {showExactDates && (
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
                                                    !startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
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
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                disabled={(date) =>
                                                    startDate ? date < startDate : false
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="flexible-dates" />
                                        <Label htmlFor="flexible-dates" className="font-normal leading-tight">My dates are flexible</Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 ml-6">We’ll show spaces that are available close to your dates.</p>
                                </div>
                            </div>
                        )}
                    </FilterGroup>

                    <FilterGroup title="Capacity & Layout">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Sleeping capacity (guests)</Label>
                                <Select defaultValue="any">
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
                                <Select defaultValue="any">
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
                                <Select defaultValue="any">
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
                                <Select defaultValue="any">
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
                                {roomStyleOptions.map(item => <CheckboxFilter key={item} item={item} />)}
                            </div>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Nightly Rate">
                        <div className="space-y-4 px-1 pt-2">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-foreground font-medium">Up to ${budget.toLocaleString()}{budget >= 20000 ? '+' : ''} / night</p>
                            </div>
                            <div className="py-3">
                                <Slider
                                    value={[budget]}
                                    onValueChange={(value) => setBudget(value[0])}
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
                                {popularAmenities.map(type => <CheckboxFilter key={type} item={type} />)}
                            </div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <h4 className="font-semibold text-sm">Other</h4>
                            <div className="space-y-3">
                                {otherAmenities.map(amenity => <CheckboxFilter key={amenity} item={amenity} />)}
                            </div>
                        </div>
                    </FilterGroup>
                    
                    <FilterGroup title="Retreat Suitability">
                        <div className="space-y-4">
                            <CheckboxFilter item="Retreat-ready spaces" description="Spaces that explicitly support retreats, workshops, and group experiences." />
                            <CheckboxFilter item="Dedicated gathering space" description="Indoor or covered space suitable for group sessions." />
                            <CheckboxFilter item="Quiet setting" description="Good for meditation, rest, and low-noise evenings." />
                            
                            <div className="space-y-2">
                                <Label>Kitchen + meal-friendly</Label>
                                <Select defaultValue="any">
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
                                {retreatPolicies.map(item => <CheckboxFilter key={item} item={item} />)}
                            </div>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Vibe">
                        <div className="space-y-4">
                            {hostVibes.map(vibe => <CheckboxFilter key={vibe.name} item={vibe.name} description={vibe.description} />)}
                            <p className="text-xs text-muted-foreground pt-1">Vibe helps us match aesthetics and energy—select all that fit.</p>
                        </div>
                    </FilterGroup>
                </Accordion>
            </CardContent>
        </Card>
    )
}
