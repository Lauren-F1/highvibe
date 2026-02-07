'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { hostSpaceTypes, hostAmenities, hostVibes, hosts } from "@/lib/mock-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';

function FilterGroup({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <AccordionItem value={title}>
            <AccordionTrigger className="text-base font-semibold py-3">{title}</AccordionTrigger>
            <AccordionContent>
                <div className="space-y-3 pt-2">
                    {children}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

function CheckboxFilter({ item }: { item: string }) {
    const id = `filter-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    return (
        <div className="flex items-center space-x-2">
            <Checkbox id={id} />
            <Label htmlFor={id} className="font-normal leading-tight">{item}</Label>
        </div>
    )
}

const locations = ["Anywhere", ...new Set(hosts.map(h => h.location))];
const sleepingCapacityOptions = ["6+", "10+", "14+", "18+", "24+", "30+"];
const bedroomOptions = ["Any", "2+", "4+", "6+", "8+", "10+"];
const bathroomOptions = ["Any", "2+", "4+", "6+", "8+"];
const roomStyleOptions = ["Private rooms available", "Shared rooms available", "Mixed (private + shared)"];
const retreatPolicies = ["Alcohol allowed", "Wellness activities allowed (yoga / sound / breathwork)", "Outdoor fires allowed (if applicable)"];


export function HostFilters() {
    const [startDate, setStartDate] = React.useState<Date>();
    const [endDate, setEndDate] = React.useState<Date>();

    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Spaces</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Location", "Availability", "Capacity & Layout", "Budget", "Space Type", "Must-Have Amenities", "Retreat Suitability", "Vibe"]} className="w-full">
                    
                    <FilterGroup title="Location">
                        <Select defaultValue="anywhere">
                            <SelectTrigger>
                                <SelectValue placeholder="Anywhere" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map(location => (
                                    <SelectItem key={location} value={location === 'Anywhere' ? 'anywhere' : location.toLowerCase().replace(/ /g, '-')}>{location}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterGroup>

                    <FilterGroup title="Availability">
                        <div className="space-y-4">
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
                    </FilterGroup>

                    <FilterGroup title="Capacity & Layout">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Sleeping Capacity</Label>
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

                    <FilterGroup title="Budget">
                         <Slider defaultValue={[2500]} max={5000} step={100} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>$0 / night</span>
                            <span>$5000+</span>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Space Type">
                        {hostSpaceTypes.map(type => <CheckboxFilter key={type} item={type} />)}
                    </FilterGroup>

                    <FilterGroup title="Must-Have Amenities">
                        {hostAmenities.map(amenity => <CheckboxFilter key={amenity} item={amenity} />)}
                    </FilterGroup>
                    
                    <FilterGroup title="Retreat Suitability">
                        <div className="space-y-4">
                             <div className="items-top flex space-x-2">
                                <Checkbox id="filter-retreat-ready" />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="filter-retreat-ready" className="font-normal leading-tight">Retreat-ready spaces</Label>
                                    <p className="text-xs text-muted-foreground">Spaces that explicitly support retreats, workshops, and group experiences.</p>
                                </div>
                            </div>
                             <div className="items-top flex space-x-2">
                                <Checkbox id="filter-gathering-space" />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="filter-gathering-space" className="font-normal leading-tight">Dedicated gathering space</Label>
                                    <p className="text-xs text-muted-foreground">Indoor or covered space suitable for group sessions.</p>
                                </div>
                            </div>
                             <div className="items-top flex space-x-2">
                                <Checkbox id="filter-quiet-setting" />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="filter-quiet-setting" className="font-normal leading-tight">Quiet setting</Label>
                                    <p className="text-xs text-muted-foreground">Good for meditation, rest, and low-noise evenings.</p>
                                </div>
                            </div>
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
                        {hostVibes.map(vibe => <CheckboxFilter key={vibe} item={vibe} />)}
                    </FilterGroup>
                </Accordion>
            </CardContent>
        </Card>
    )
}
