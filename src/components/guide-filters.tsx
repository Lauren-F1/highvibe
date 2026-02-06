'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { hostVibes } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const experienceTypes = [
    "Wellness & Healing",
    "Yoga & Meditation",
    "Personal Growth",
    "Spiritual Exploration",
    "Leadership",
    "Adventure & Aliveness",
    "Creativity & Expression",
    "Nature Immersion",
];

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
            <Checkbox id={`filter-guide-${item}`} />
            <Label htmlFor={`filter-guide-${item}`} className="font-normal leading-tight">{item}</Label>
        </div>
    )
}


export function GuideFilters() {
    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Guides</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Retreat Type", "Group Size", "Vibe", "Timing"]} className="w-full">
                    <FilterGroup title="Retreat Type">
                        {experienceTypes.map(type => <CheckboxFilter key={type} item={type} />)}
                    </FilterGroup>

                    <FilterGroup title="Group Size">
                        <Slider defaultValue={[20]} max={100} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 guest</span>
                            <span>100+ guests</span>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Vibe">
                        {hostVibes.map(vibe => <CheckboxFilter key={vibe} item={vibe} />)}
                    </FilterGroup>

                     <FilterGroup title="Timing">
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
                </Accordion>
            </CardContent>
        </Card>
    )
}
