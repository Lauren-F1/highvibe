'use client';

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";

const serviceCategories = [
    "Private chef / catering",
    "Transportation / drivers",
    "Photography / videography",
    "Wellness practitioners",
    "Music / DJ / sound healing",
    "Artists / creative workshops",
    "Guides / translators",
    "Outdoor adventure partners",
    "Event rentals",
    "Concierge / logistics support",
];

const pricingTiers = ["Budget", "Mid-range", "Premium", "Luxury"];

export function VendorFilters() {
    return (
         <Card>
            <CardHeader>
                 <CardTitle className="text-lg font-semibold font-headline">Filter Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Service Category</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {serviceCategories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Pricing Tier</Label>
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a pricing tier" />
                        </SelectTrigger>
                        <SelectContent>
                            {pricingTiers.map(tier => (
                                <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Available Dates</Label>
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
                </div>
                <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="lux-approved-vendor">LUX-approved</Label>
                    <Switch id="lux-approved-vendor" />
                </div>
            </CardContent>
        </Card>
    )
}
