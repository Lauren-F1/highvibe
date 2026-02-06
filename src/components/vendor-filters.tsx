'use client';

import { Label } from "@/components/ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { vendorCategories, vendorPricingTiers } from "@/lib/mock-data";


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
    return (
        <div className="flex items-center space-x-2">
            <Checkbox id={`filter-${item}`} />
            <Label htmlFor={`filter-${item}`} className="font-normal leading-tight">{item}</Label>
        </div>
    )
}

export function VendorFilters() {
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
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span>Pick a date range</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="range" />
                            </PopoverContent>
                        </Popover>
                    </FilterGroup>
                </Accordion>
            </CardContent>
        </Card>
    )
}
