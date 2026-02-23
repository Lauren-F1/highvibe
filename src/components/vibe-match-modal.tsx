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
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from 'lucide-react';

interface VibeMatchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vibeImages: string[];
  onVibeImagesChange: (images: string[]) => void;
  activeRetreatId: string | null;
}

export function VibeMatchModal({ isOpen, onOpenChange, vibeImages, onVibeImagesChange, activeRetreatId }: VibeMatchModalProps) {
  const { toast } = useToast();

  const handleFindMatches = () => {
    toast({ title: "Vibe Matching Coming Soon!" });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-3xl">
            <Sparkles className="text-beige h-6 w-6" />
            Match by Vibe
          </DialogTitle>
          <DialogDescription>
            Upload up to 4 inspiration images for your retreat's aesthetic. Our AI will find partners with a similar visual style.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ImageUpload
            value={vibeImages}
            onChange={(urls) => onVibeImagesChange(urls as string[])}
            storagePath={`temp/vibe-matcher/${activeRetreatId || 'unknown'}`}
            multiple
            maxFiles={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleFindMatches} disabled={vibeImages.length === 0}>
            Find Vibe Matches
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
