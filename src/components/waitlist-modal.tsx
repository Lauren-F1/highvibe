'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WaitlistForm } from "./waitlist-form";

type RoleShort = "Seeker" | "Guide" | "Host" | "Vendor" | "Partner / Collaborator" | "";

interface WaitlistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
  defaultRole?: RoleShort;
}

const getRoleValue = (role?: RoleShort) => {
    if (!role || role === "") return undefined;
    switch(role) {
        case "Seeker": return "Seeker (I want to find/book retreats)";
        case "Guide": return "Guide (I want to host retreats)";
        case "Host": return "Host (I have a space)";
        case "Vendor": return "Vendor (I offer services)";
        case "Partner / Collaborator": return "Partner / Collaborator";
        default: return undefined;
    }
}


export function WaitlistModal({ 
  isOpen, 
  onOpenChange, 
  source,
  defaultRole
}: WaitlistModalProps) {
  
  const roleInterestValue = getRoleValue(defaultRole);
  const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center">
           {isLaunchMode && (
            <p className="text-sm font-semibold text-primary mb-2">
              Prelaunch: join the waitlist for early access.
            </p>
          )}
          <DialogTitle className="font-headline text-3xl md:text-4xl">Be First In</DialogTitle>
          <DialogDescription className="text-lg text-beige-dark mt-2 max-w-3xl mx-auto font-body">
            HighVibe Retreats is launching soon. Join the waitlist for early access and founder-level perks.
          </DialogDescription>
          <p className="text-base text-foreground pt-4 max-w-3xl mx-auto font-body font-semibold">
                Founder Perk: first 250 verified sign-ups get 60 days of membership fees waived.
            </p>
        </DialogHeader>
        <div className="pt-4">
          <WaitlistForm source={source || 'modal-popup'} defaultRole={roleInterestValue} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
