
'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { hostSpaceTypes } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


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
            <Checkbox id={`filter-host-vendor-${item}`} />
            <Label htmlFor={`filter-host-vendor-${item}`} className="font-normal leading-tight">{item}</Label>
        </div>
    )
}

export function VendorHostFilters() {
    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Hosts</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Property Location", "Property Type", "Capacity", "Retreat Frequency"]} className="w-full">
                    
                    <FilterGroup title="Property Location">
                         <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bali">Bali, Indonesia</SelectItem>
                                <SelectItem value="kyoto">Kyoto, Japan</SelectItem>
                                <SelectItem value="cusco">Cusco, Peru</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterGroup>
                    
                    <FilterGroup title="Property Type">
                        {hostSpaceTypes.map(type => <CheckboxFilter key={type} item={type} />)}
                    </FilterGroup>
                    
                    <FilterGroup title="Capacity">
                        <Slider defaultValue={[20]} max={100} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 guest</span>
                            <span>100+ guests</span>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Retreat Frequency">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Any frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high">High (10+/year)</SelectItem>
                                <SelectItem value="medium">Medium (5-10/year)</SelectItem>
                                <SelectItem value="low">Low (1-4/year)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterGroup>

                </Accordion>
            </CardContent>
        </Card>
    )
}
