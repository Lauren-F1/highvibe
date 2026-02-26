'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WaitlistForm } from "./waitlist-form";
import {
  FOUNDER_PERK_BY_ROLE,
  FOUNDER_PERK_DISCLAIMER,
  roleLabelToBucket,
  formValueToRoleBucket,
  type RoleBucket,
} from "@/lib/waitlist-constants";

type RoleShort = "Seeker" | "Guide" | "Host" | "Vendor" | "";

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
        case "Guide": return "Guide (I want to lead retreats)";
        case "Host": return "Host (I have a space)";
        case "Vendor": return "Vendor (I offer services)";
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

  // Track the currently selected role for dynamic perk copy
  const [currentRoleBucket, setCurrentRoleBucket] = useState<RoleBucket | null>(
    defaultRole ? roleLabelToBucket(defaultRole) : null
  );

  // Sync when defaultRole changes (e.g. user clicks a different role card)
  useEffect(() => {
    setCurrentRoleBucket(defaultRole ? roleLabelToBucket(defaultRole) : null);
  }, [defaultRole]);

  const handleRoleChange = (formValue: string) => {
    setCurrentRoleBucket(formValueToRoleBucket(formValue));
  };

  const perkCopy = currentRoleBucket
    ? FOUNDER_PERK_BY_ROLE[currentRoleBucket]
    : FOUNDER_PERK_DISCLAIMER;

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
            {perkCopy}
          </p>
        </DialogHeader>
        <div className="pt-4">
          <WaitlistForm
            source={source || 'homepage'}
            defaultRole={roleInterestValue}
            onRoleChange={handleRoleChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
