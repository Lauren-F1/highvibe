'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Button } from "./ui/button";

interface PaywallModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaywallModal({ isOpen, onOpenChange }: PaywallModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activate Your Membership</AlertDialogTitle>
          <AlertDialogDescription>
            An active membership is required to connect with hosts and vendors, and to create new retreats.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <AlertDialogAction asChild>
            <Link href="/billing">Manage Subscription</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
