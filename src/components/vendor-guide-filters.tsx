
'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { vendorCategories } from "@/lib/mock-data";

const retreatTypes = [
    "Wellness", "Spiritual", "Personal Growth", "Leadership", "Adventure", "Plant Medicine", "Creative", "Nature Immersion", "Luxury"
];

const budgetTiers = ["$", "$$", "$$$", "$$$$"];


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
            <Checkbox id={`filter-guide-vendor-${item}`} />
            <Label htmlFor={`filter-guide-vendor-${item}`} className="font-normal leading-tight">{item}</Label>
        </div>
    )
}

export function VendorGuideFilters() {
    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Guides</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Retreat Location", "Retreat Type", "Date Range", "Group Size", "Budget Tier", "Service Needed"]} className="w-full">
                    
                    <FilterGroup title="Retreat Location">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bali">Bali, Indonesia</SelectItem>
                                <SelectItem value="kyoto">Kyoto, Japan</SelectItem>
                                <SelectItem value="cusco">Cusco, Peru</SelectItem>
                                <SelectItem value="global">Global</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterGroup>
                    
                    <FilterGroup title="Retreat Type">
                        {retreatTypes.map(type => <CheckboxFilter key={type} item={type} />)}
                    </FilterGroup>
                    
                    <FilterGroup title="Date Range">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Anytime" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3-months">Next 3 months</SelectItem>
                                <SelectItem value="6-months">Next 6 months</SelectItem>
                                <SelectItem value="12-months">Next 12 months</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterGroup>

                    <FilterGroup title="Group Size">
                        <Slider defaultValue={[20]} max={100} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 guest</span>
                            <span>100+ guests</span>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Budget Tier">
                        {budgetTiers.map(tier => <CheckboxFilter key={tier} item={tier} />)}
                    </FilterGroup>

                    <FilterGroup title="Service Needed">
                        {vendorCategories.slice(0,5).map(service => <CheckboxFilter key={service.name} item={service.name} />)}
                    </FilterGroup>

                </Accordion>
            </CardContent>
        </Card>
    )
}
