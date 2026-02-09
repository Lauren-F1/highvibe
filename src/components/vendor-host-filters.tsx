
'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { hostSpaceTypes } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

export interface VendorHostFiltersState {
  location: string;
  propertyTypes: string[];
  capacity: number;
  retreatFrequency: string;
}

interface VendorHostFiltersProps {
  filters: VendorHostFiltersState;
  onFiltersChange: (filters: Partial<VendorHostFiltersState>) => void;
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

export function VendorHostFilters({ filters, onFiltersChange, onApply, onReset, isDirty }: VendorHostFiltersProps) {
    
    const handleCheckboxChange = (item: string, checked: boolean) => {
        const currentValues = filters.propertyTypes || [];
        const newValues = checked
            ? [...currentValues, item]
            : currentValues.filter(v => v !== item);
        onFiltersChange({ propertyTypes: newValues });
    };

    const CheckboxFilter = ({ item }: { item: string }) => {
        const id = `filter-host-vendor-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        return (
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={id}
                    checked={filters.propertyTypes.includes(item)}
                    onCheckedChange={(checked) => handleCheckboxChange(item, !!checked)}
                />
                <Label htmlFor={id} className="font-normal leading-tight">{item}</Label>
            </div>
        )
    }
    
    const getCapacityLabel = () => {
        if (filters.capacity >= 100) return "Up to 100+ guests";
        return `Up to ${filters.capacity} guests`;
    }


    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Filter Hosts</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["Property Location", "Property Type", "Capacity", "Retreat Frequency"]} className="w-full">
                    
                    <FilterGroup title="Property Location">
                         <Select value={filters.location} onValueChange={(value) => onFiltersChange({ location: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any Location</SelectItem>
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
                        <div className="text-sm font-medium" aria-live="polite">{getCapacityLabel()}</div>
                        <Slider
                            value={[filters.capacity]}
                            onValueChange={(value) => onFiltersChange({ capacity: value[0] })}
                            defaultValue={[20]} max={100} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 guest</span>
                            <span>100+ guests</span>
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Retreat Frequency">
                        <Select value={filters.retreatFrequency} onValueChange={(value) => onFiltersChange({ retreatFrequency: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Any frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any frequency</SelectItem>
                                <SelectItem value="high">High (10+/year)</SelectItem>
                                <SelectItem value="medium">Medium (5-10/year)</SelectItem>
                                <SelectItem value="low">Low (1-4/year)</SelectItem>
                            </SelectContent>
                        </Select>
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
