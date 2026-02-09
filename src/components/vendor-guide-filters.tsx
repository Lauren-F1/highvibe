
'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { vendorCategories } from "@/lib/mock-data";
import { Button } from "./ui/button";

const retreatTypes = [
    "Wellness", "Spiritual", "Personal Growth", "Leadership", "Adventure", "Plant Medicine", "Creative", "Nature Immersion", "Luxury"
];

const budgetTiers = ["$", "$$", "$$$", "$$$$"];

export interface VendorGuideFiltersState {
  location: string;
  retreatTypes: string[];
  dateRange: string;
  groupSize: number;
  budgetTiers: string[];
  services: string[];
}

interface VendorGuideFiltersProps {
  filters: VendorGuideFiltersState;
  onFiltersChange: (filters: Partial<VendorGuideFiltersState>) => void;
  onApply: () => void;
  onReset: () => void;
  isDirty: boolean;
}

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

export function VendorGuideFilters({ filters, onFiltersChange, onApply, onReset, isDirty }: VendorGuideFiltersProps) {

    const handleCheckboxChange = (group: 'retreatTypes' | 'budgetTiers' | 'services', item: string, checked: boolean) => {
        const currentValues = filters[group] || [];
        const newValues = checked
            ? [...currentValues, item]
            : currentValues.filter(v => v !== item);
        onFiltersChange({ [group]: newValues });
    };
    
    const CheckboxFilter = ({ item, group }: { item: string, group: 'retreatTypes' | 'budgetTiers' | 'services' }) => {
        const id = `filter-guide-vendor-${group}-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        return (
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={id}
                    checked={filters[group].includes(item)}
                    onCheckedChange={(checked) => handleCheckboxChange(group, item, !!checked)}
                />
                <Label htmlFor={id} className="font-normal leading-tight">{item}</Label>
            </div>
        )
    }
    
    const getGroupSizeLabel = () => {
        if (filters.groupSize >= 100) return "Up to 100+ guests";
        return `Up to ${filters.groupSize} guests`;
    }

    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Guides</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Retreat Location", "Retreat Type", "Date Range", "Group Size", "Budget Tier", "Service Needed"]} className="w-full">
                    
                    <FilterGroup title="Retreat Location">
                        <Select value={filters.location} onValueChange={(value) => onFiltersChange({ location: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any Location</SelectItem>
                                <SelectItem value="bali">Bali, Indonesia</SelectItem>
                                <SelectItem value="kyoto">Kyoto, Japan</SelectItem>
                                <SelectItem value="cusco">Cusco, Peru</SelectItem>
                                <SelectItem value="global">Global</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterGroup>
                    
                    <FilterGroup title="Retreat Type">
                        {retreatTypes.map(type => <CheckboxFilter key={type} item={type} group="retreatTypes"/>)}
                    </FilterGroup>
                    
                    <FilterGroup title="Date Range">
                        <Select value={filters.dateRange} onValueChange={(value) => onFiltersChange({ dateRange: value })}>
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

                    <FilterGroup title="Group Size">
                        <div className="text-sm font-medium" aria-live="polite">{getGroupSizeLabel()}</div>
                        <Slider
                            value={[filters.groupSize]}
                            onValueChange={(value) => onFiltersChange({ groupSize: value[0] })}
                            defaultValue={[20]} max={100} step={1}
                         />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 guest</span>
                            <span>100+ guests</span>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Budget Tier">
                        {budgetTiers.map(tier => <CheckboxFilter key={tier} item={tier} group="budgetTiers" />)}
                    </FilterGroup>

                    <FilterGroup title="Service Needed">
                        {vendorCategories.slice(0,5).map(service => <CheckboxFilter key={service.name} item={service.name} group="services"/>)}
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
