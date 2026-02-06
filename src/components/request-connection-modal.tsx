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
  role: 'Host' | 'Vendor' | 'Guide';
}

export function RequestConnectionModal({ isOpen, onOpenChange, name, role }: RequestConnectionModalProps) {
  const handleSubmit = () => {
    alert('Connection request sent!');
    onOpenChange(false);
  }
  
  const getPlaceholderText = () => {
    switch (role) {
        case 'Host':
            return `Hi ${name}, I'm interested in your space for my upcoming retreat...`;
        case 'Vendor':
            return `Hi ${name}, I'm interested in your services for my upcoming retreat...`;
        case 'Guide':
            return `Hi ${name}, I think my space would be a great fit for your next retreat...`;
        default:
            return `Hi ${name}, I'd like to connect...`;
    }
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
                <Textarea id="message" placeholder={getPlaceholderText()} rows={5} />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Send Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
