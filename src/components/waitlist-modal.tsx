
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WaitlistForm } from "./waitlist-form";

interface WaitlistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
  title?: string;
  description?: string;
}

export function WaitlistModal({ 
  isOpen, 
  onOpenChange, 
  source,
  title = "Coming Soon",
  description = "We’re launching in phases. Join the waitlist to get notified first."
}: WaitlistModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <WaitlistForm source={source} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

    