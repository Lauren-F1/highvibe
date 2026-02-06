'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RequestConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  role: 'Host' | 'Vendor';
}

export function RequestConnectionModal({ isOpen, onOpenChange, name, role }: RequestConnectionModalProps) {
  const handleSubmit = () => {
    alert('Connection request sent!');
    onOpenChange(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Connect with {name}</DialogTitle>
          <DialogDescription>
            Send a message to start a conversation. This will create a private chat thread in your inbox.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder={`Hi ${name}, I\'m interested in your ${role === 'Host' ? 'space' : 'services'} for my upcoming retreat...`} rows={5} />
            </div>
            {/* Other fields like dates, headcount would go here */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Send Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
