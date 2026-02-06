'use client';

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const propertyTypes = ["Villa", "Estate", "Lodge", "Boutique Hotel", "Ranch", "Retreat Center"];
const amenities = ["Pool", "Ocean View", "Sauna", "Yoga Shala", "Chef’s Kitchen", "Sound Bath Space", "Accessibility"];
const retreatStyles = ["Wellness", "Spiritual", "Personal Growth", "Leadership", "Adventure", "Plant Medicine", "Creative", "Nature Immersion", "Luxury"];
const energyStyles = ["Quiet/Restorative", "Social/Communal", "Luxury/High-End", "Adventure/Rugged"];

export function HostFilters() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold font-headline">Filter Spaces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Price per night</Label>
                    <Slider defaultValue={[2500]} max={5000} step={100} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$0</span>
                        <span>$5000+</span>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Slider defaultValue={[20]} max={100} step={1} />
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 guest</span>
                        <span>100+ guests</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <Label>Property Type</Label>
                    {propertyTypes.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                            <Checkbox id={`type-${type}`} />
                            <Label htmlFor={`type-${type}`} className="font-normal">{type}</Label>
                        </div>
                    ))}
                </div>
                <div className="space-y-3">
                    <Label>Amenities</Label>
                    {amenities.map(amenity => (
                         <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox id={`amenity-${amenity}`} />
                            <Label htmlFor={`amenity-${amenity}`} className="font-normal">{amenity}</Label>
                        </div>
                    ))}
                </div>
                 <div className="space-y-3">
                    <Label>Energy Style</Label>
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select energy style" />
                        </SelectTrigger>
                        <SelectContent>
                            {energyStyles.map(style => (
                                <SelectItem key={style} value={style}>{style}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="retreat-ready">Retreat-ready</Label>
                    <Switch id="retreat-ready" />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="lux-approved">LUX-approved</Label>
                    <Switch id="lux-approved" />
                </div>
            </CardContent>
        </Card>
    )
}
