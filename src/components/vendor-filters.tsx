'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { vendorCategories, vendorPricingTiers } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';


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
    const id = `filter-vendor-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    return (
        <div className="flex items-center space-x-2">
            <Checkbox id={id} />
            <Label htmlFor={id} className="font-normal leading-tight">{item}</Label>
        </div>
    )
}

export function VendorFilters() {
    const [startDate, setStartDate] = React.useState<Date>();
    const [endDate, setEndDate] = React.useState<Date>();
    const [showExactDates, setShowExactDates] = React.useState(false);

    return (
         <Card className="lg:sticky lg:top-24">
            <CardHeader>
                 <CardTitle className="text-xl font-headline font-bold">Filter Services</CardTitle>
            </CardHeader>
            <CardContent>
                 <Accordion type="multiple" defaultValue={["Vendor Category", "Pricing Tier", "Availability"]} className="w-full">
                    <FilterGroup title="Vendor Category">
                        {vendorCategories.map(category => <CheckboxFilter key={category} item={category} />)}
                    </FilterGroup>

                    <FilterGroup title="Pricing Tier">
                        {vendorPricingTiers.map(tier => <CheckboxFilter key={tier} item={tier} />)}
                    </FilterGroup>

                    <FilterGroup title="Availability">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Availability Window</Label>
                                <Select defaultValue="anytime">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Anytime" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="anytime">Anytime</SelectItem>
                                        <SelectItem value="3-months">Within 3 months</SelectItem>
                                        <SelectItem value="3-6-months">3–6 months</SelectItem>
                                        <SelectItem value="6-9-months">6–9 months</SelectItem>
                                        <SelectItem value="9-12-months">9–12 months</SelectItem>
                                        <SelectItem value="12-plus-months">12+ months</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground pt-1">
                                    Most retreats are planned months in advance. Choose a general timeframe to see vendors that fit your planning window.
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch id="exact-dates-toggle-vendor" onCheckedChange={setShowExactDates} checked={showExactDates} />
                                <Label htmlFor="exact-dates-toggle-vendor">I have exact dates.</Label>
                            </div>

                            {showExactDates && (
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
                                        <Label htmlFor="end-date-vendor">End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="end-date-vendor"
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
                                </div>
                            )}
                        </div>
                    </FilterGroup>
                </Accordion>
            </CardContent>
        </Card>
    )
}
