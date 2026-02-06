'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { hostSpaceTypes, hostAmenities, hostVibes } from "@/lib/mock-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

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


export function HostFilters() {
    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Spaces</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Group Size", "Budget", "Space Type", "Must-Have Amenities", "Vibe"]} className="w-full">
                    <FilterGroup title="Group Size">
                        <Slider defaultValue={[20]} max={100} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 guest</span>
                            <span>100+ guests</span>
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

                    <FilterGroup title="Vibe">
                        {hostVibes.map(vibe => <CheckboxFilter key={vibe} item={vibe} />)}
                    </FilterGroup>
                </Accordion>
            </CardContent>
        </Card>
    )
}
