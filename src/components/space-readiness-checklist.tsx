
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import Link from 'next/link';
import { Button } from "./ui/button";

interface ChecklistItemProps {
  isComplete: boolean;
  label: string;
  actionText: string;
  actionHref: string;
}

const ChecklistItem = ({ isComplete, label, actionText, actionHref }: ChecklistItemProps) => {
    const handleActionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (actionHref.startsWith('#')) {
            e.preventDefault();
            // In a real app, this might scroll or open a modal/page to edit the listing
            alert(`Action: ${actionText}. This would navigate to the edit page for your space.`);
        }
    };
    
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            {isComplete ? <CheckCircle2 className="h-4 w-4 text-beige" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
            <span className={isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}>{label}</span>
            </div>
            {!isComplete && (
            <Button variant="link" size="sm" asChild className="text-beige-dark p-0 h-auto">
                <Link href={actionHref} onClick={handleActionClick}>{actionText}</Link>
            </Button>
            )}
        </div>
    );
};

export interface SpaceReadinessProps {
    availabilitySet: boolean;
    rateSet: boolean;
    hasMinPhotos: boolean;
    hasAmenities: boolean;
    hasDescription: boolean;
}

export const SpaceReadinessChecklist = ({ availabilitySet, rateSet, hasMinPhotos, hasAmenities, hasDescription }: SpaceReadinessProps) => {
  const allComplete = availabilitySet && rateSet && hasMinPhotos && hasAmenities && hasDescription;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Space Readiness</CardTitle>
        <CardDescription>
            {allComplete 
                ? "This space is ready for prime time!" 
                : "Complete these steps to attract more guides."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChecklistItem isComplete={availabilitySet} label="Availability calendar is set" actionText="Set Dates" actionHref="#" />
        <ChecklistItem isComplete={rateSet} label="Nightly rate is set" actionText="Set Rate" actionHref="#" />
        <ChecklistItem isComplete={hasMinPhotos} label="At least 6 photos uploaded" actionText="Add Photos" actionHref="#" />
        <ChecklistItem isComplete={hasAmenities} label="Amenities are filled out" actionText="Add Amenities" actionHref="#" />
        <ChecklistItem isComplete={hasDescription} label="Listing has a description" actionText="Add Description" actionHref="#" />
      </CardContent>
    </Card>
  );
};
