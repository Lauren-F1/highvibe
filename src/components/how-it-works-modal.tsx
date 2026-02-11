'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
    { title: "Share Your Vision", description: "Tell us about your ideal retreat—destination, dates, vibe, and must-haves." },
    { title: "Get Matched", description: "We connect you with aligned hosts, guides, and vendors from our curated network." },
    { title: "Receive Proposals", description: "Review custom proposals and options tailored to your manifestation." },
    { title: "Build Your Dream Retreat", description: "Choose the partners that fit your vision and assemble your perfect experience." },
    { title: "Earn Credit", description: "After your retreat is complete, you’ll earn up to $500 in credit toward your next one." },
];

export function HowItWorksModal({ isOpen, onOpenChange }: HowItWorksModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">How Manifesting Works</DialogTitle>
          <DialogDescription>
            Your vision, brought to life by our network.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
