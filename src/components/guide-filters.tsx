'use client';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { hostVibes } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

export interface GuideFiltersState {
  experienceTypes: string[];
  groupSize: number;
  vibes: string[];
  timing: string;
}

interface GuideFiltersProps {
  filters: GuideFiltersState;
  onFiltersChange: (filters: Partial<GuideFiltersState>) => void;
  onApply: () => void;
  onReset: () => void;
}

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

export function GuideFilters({ filters, onFiltersChange, onApply, onReset }: GuideFiltersProps) {

    const handleCheckboxChange = (group: 'experienceTypes' | 'vibes', item: string, checked: boolean) => {
        const currentValues = filters[group] || [];
        const newValues = checked
            ? [...currentValues, item]
            : currentValues.filter(v => v !== item);
        onFiltersChange({ [group]: newValues });
    };

    const CheckboxFilter = ({ item, description, group }: { item: string, description?: string, group: 'experienceTypes' | 'vibes' }) => {
        const id = `filter-guide-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        return (
            <div className="flex items-start space-x-3">
                <Checkbox 
                    id={id} 
                    className="mt-0.5" 
                    checked={filters[group].includes(item)}
                    onCheckedChange={(checked) => handleCheckboxChange(group, item, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={id} className="font-normal leading-tight">{item}</Label>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
        )
    }

    const getGroupSizeLabel = () => {
        if (filters.groupSize === 1) return "Up to 1 guest";
        if (filters.groupSize >= 100) return "Up to 100+ guests";
        return `Up to ${filters.groupSize} guests`;
    }

    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Guides</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Retreat Type", "Group Size", "Vibe", "Timing"]} className="w-full">
                    <FilterGroup title="Retreat Type">
                        {experienceTypes.map(type => <CheckboxFilter key={type} item={type} group="experienceTypes" />)}
                    </FilterGroup>

                    <FilterGroup title="Group Size">
                        <div className="space-y-2 px-1 pt-1">
                            <div className="text-sm font-medium" aria-live="polite">
                                {getGroupSizeLabel()}
                            </div>
                            <Slider
                                value={[filters.groupSize]}
                                onValueChange={(value) => onFiltersChange({ groupSize: value[0] })}
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
                        {hostVibes.map(vibe => <CheckboxFilter key={vibe.name} item={vibe.name} description={vibe.description} group="vibes" />)}
                    </FilterGroup>

                     <FilterGroup title="Timing">
                        <Select value={filters.timing} onValueChange={(value) => onFiltersChange({ timing: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Anytime" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="anytime">Anytime</SelectItem>
                                <SelectItem value="3-months">Next 3 months</SelectItem>
                                <SelectItem value="6-months">Next 6 months</SelectItem>
                                <SelectItem value="12-months">Next 12 months</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterGroup>
                </Accordion>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4">
                <Button onClick={onApply} className="w-full">Apply Filters</Button>
                <Button onClick={onReset} variant="ghost" className="w-full">Reset</Button>
            </CardFooter>
        </Card>
    )
}
