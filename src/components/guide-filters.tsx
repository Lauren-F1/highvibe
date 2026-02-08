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

function CheckboxFilter({ item, description }: { item: string, description?: string }) {
    const id = `filter-guide-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
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

interface GuideFiltersProps {
  groupSize: number;
  onGroupSizeChange: (value: number) => void;
}


export function GuideFilters({ groupSize, onGroupSizeChange }: GuideFiltersProps) {

    const getGroupSizeLabel = () => {
        if (groupSize === 1) return "Up to 1 guest";
        if (groupSize === 100) return "Up to 100+ guests";
        return `Up to ${groupSize} guests`;
    }

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
                        <div className="space-y-2 px-1 pt-1">
                            <div className="text-sm font-medium" aria-live="polite">
                                {getGroupSizeLabel()}
                            </div>
                            <Slider
                                value={[groupSize]}
                                onValueChange={(value) => onGroupSizeChange(value[0])}
                                min={1}
                                max={100}
                                step={1}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                <span>1 guest</span>
                                <span>100+ guests</span>
                            </div>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Vibe">
                        {hostVibes.map(vibe => <CheckboxFilter key={vibe.name} item={vibe.name} description={vibe.description} />)}
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
