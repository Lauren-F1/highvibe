
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { vendorCategories } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';


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

const planningWindowOptions = [
    { value: 'anytime', label: 'Anytime' },
    { value: '1-3-months', label: '1–3 months' },
    { value: '3-6-months', label: '3–6 months' },
    { value: '6-9-months', label: '6–9 months' },
    { value: '9-12-months', label: '9–12 months' },
    { value: '12-plus-months', label: '12+ months' },
];

export interface VendorFiltersState {
  categories: string[];
  locationPreference: 'local' | 'travel' | 'remote';
  budget: number;
  planningWindow: string;
  availabilityTypes: string[];
  showNearMatches: boolean;
  showExactDates: boolean;
  startDate?: Date;
  endDate?: Date;
  radius: number;
}

interface VendorFiltersProps {
    filters: VendorFiltersState;
    onFiltersChange: (filters: Partial<VendorFiltersState>) => void;
    onApply: () => void;
    onReset: () => void;
    isDirty: boolean;
}


export function VendorFilters({ filters, onFiltersChange, onApply, onReset, isDirty }: VendorFiltersProps) {

    const handleCategoryChange = (category: string, checked: boolean) => {
        const newCategories = checked
            ? [...filters.categories, category]
            : filters.categories.filter(c => c !== category);
        onFiltersChange({ categories: newCategories });
    };

    const CheckboxFilter = ({ item, description }: { item: string, description?: string }) => {
        const id = `filter-vendor-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        return (
            <div className="flex items-start space-x-3">
                <Checkbox 
                    id={id} 
                    className="mt-0.5" 
                    checked={filters.categories.includes(item)}
                    onCheckedChange={(checked) => handleCategoryChange(item, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={id} className="font-normal leading-tight">{item}</Label>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
        )
    };


    return (
         <Card className="lg:sticky lg:top-24">
            <CardHeader>
                 <CardTitle className="text-xl font-headline font-bold">Filter Services</CardTitle>
            </CardHeader>
            <CardContent>
                 <Accordion type="multiple" defaultValue={["Vendor Category", "Location", "Budget Range", "Availability"]} className="w-full">
                    <FilterGroup title="Vendor Category">
                        {vendorCategories.map(category => <CheckboxFilter key={category.name} item={category.name} description={category.description} />)}
                    </FilterGroup>

                    <FilterGroup title="Location">
                        <div className="space-y-2">
                            <Label>Where should the vendor be?</Label>
                            <Select 
                                value={filters.locationPreference} 
                                onValueChange={(value) => onFiltersChange({ locationPreference: value as VendorFiltersState['locationPreference'] })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select location preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="local">Local to my destination</SelectItem>
                                    <SelectItem value="travel">Will travel to my destination</SelectItem>
                                    <SelectItem value="remote">Remote/virtual only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Service Radius</Label>
                            <Select value={String(filters.radius)} onValueChange={(value) => onFiltersChange({ radius: Number(value) })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select radius" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">Within 10 miles</SelectItem>
                                    <SelectItem value="25">Within 25 miles</SelectItem>
                                    <SelectItem value="50">Within 50 miles</SelectItem>
                                    <SelectItem value="100">Within 100 miles</SelectItem>
                                    <SelectItem value="200">Within 200 miles</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Budget Range">
                        <div className="space-y-4 px-1 pt-2">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-foreground font-medium">Up to ${filters.budget.toLocaleString()}{filters.budget >= 5000 ? '+' : ''}</p>
                            </div>
                            <div className="py-3">
                                <Slider
                                    value={[filters.budget]}
                                    onValueChange={(value) => onFiltersChange({ budget: value[0]})}
                                    max={5000}
                                    step={100}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground -mt-2">
                                <span>$0</span>
                                <span>$5,000+</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-1">
                                Filter by per-day rate or total package cost.
                            </p>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Availability">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Planning Window</Label>
                                <Select 
                                    value={filters.planningWindow}
                                    onValueChange={(value) => onFiltersChange({ planningWindow: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Anytime" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {planningWindowOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground pt-1">
                                    This helps you find vendors who are a fit for your planning window. Exact dates can be finalized together.
                                </p>
                            </div>
                             <div className="flex items-start space-x-3 pt-2">
                                <Switch 
                                    id="near-matches-toggle-vendor" 
                                    onCheckedChange={(checked) => onFiltersChange({ showNearMatches: checked })} 
                                    checked={filters.showNearMatches} 
                                    className="mt-0.5" 
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="near-matches-toggle-vendor" className="font-normal">Show near matches</Label>
                                    <p className="text-xs text-muted-foreground">We’ll include vendors that are close to your ideal window.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 pt-2">
                                <Switch 
                                    id="exact-dates-toggle-vendor" 
                                    onCheckedChange={(checked) => onFiltersChange({ showExactDates: checked })} 
                                    checked={filters.showExactDates} 
                                    className="mt-0.5" 
                                />
                                <Label htmlFor="exact-dates-toggle-vendor" className="font-normal">I have exact dates (optional)</Label>
                            </div>

                            {filters.showExactDates && (
                                <div className="space-y-4 pt-4 mt-4 border-t">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-date-vendor">Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="start-date-vendor"
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
                                                    onSelect={(date) => onFiltersChange({ startDate: date as Date })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-date-vendor">End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="end-date-vendor"
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
                                                    onSelect={(date) => onFiltersChange({ endDate: date as Date })}
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
                        </div>
                    </FilterGroup>
                </Accordion>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4">
                <Button onClick={onApply} className="w-full" disabled={!isDirty}>Apply Filters</Button>
                <Button onClick={onReset} variant="ghost" className="w-full">Reset</Button>
            </CardFooter>
        </Card>
    )
}
