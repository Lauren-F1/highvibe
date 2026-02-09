
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
            document.querySelector(actionHref)?.scrollIntoView({ behavior: 'smooth' });
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

export interface RetreatReadinessProps {
    datesSet: boolean;
    capacitySet: boolean;
    hostsShortlisted: boolean;
    vendorsInvited: boolean;
    activeConversations: boolean;
}

export const RetreatReadinessChecklist = ({ datesSet, capacitySet, hostsShortlisted, vendorsInvited, activeConversations }: RetreatReadinessProps) => {
  const allComplete = datesSet && capacitySet && hostsShortlisted && vendorsInvited && activeConversations;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Retreat Readiness</CardTitle>
        <CardDescription>
            {allComplete 
                ? "This retreat is ready for marketing and booking!" 
                : "Complete these steps to get your retreat ready."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChecklistItem isComplete={datesSet} label="Retreat dates set" actionText="Set Dates" actionHref="#" />
        <ChecklistItem isComplete={capacitySet} label="Guest capacity set" actionText="Set Capacity" actionHref="#" />
        <ChecklistItem isComplete={hostsShortlisted} label="At least 3 spaces shortlisted" actionText="Find Spaces" actionHref="#partnership-dashboard" />
        <ChecklistItem isComplete={vendorsInvited} label="At least 2 vendors invited" actionText="Find Vendors" actionHref="#partnership-dashboard" />
        <ChecklistItem isComplete={activeConversations} label="At least 1 active conversation" actionText="Go to Inbox" actionHref="/inbox" />
      </CardContent>
    </Card>
  );
};
