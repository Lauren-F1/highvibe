'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, CheckCircle, Bookmark } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isFirebaseEnabled } from '@/firebase/config';
import { useState } from 'react';
import Link from 'next/link';

interface RetreatCardProps {
  retreat: {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    rating: number;
    image: ImagePlaceholder;
    duration?: string;
    included?: string;
  };
  isLux?: boolean;
}

export function RetreatCard({ retreat, isLux = false }: RetreatCardProps) {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const isSaved = user.status === 'authenticated' && user.profile?.savedRetreatIds?.includes(retreat.id) || false;

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsProcessing(true);

    if (user.status !== 'authenticated' || (!firestore && isFirebaseEnabled)) {
      toast({
        title: 'Please log in to save retreats',
        description: 'You will be redirected to the login page.',
        action: <Button onClick={() => router.push('/login?redirect=/seeker')}>Login</Button>,
      });
      setIsProcessing(false);
      return;
    }

    if (!isFirebaseEnabled) {
      // Dev mode handling
      const currentSaved = JSON.parse(localStorage.getItem('devSavedRetreats') || '[]');
      let newSaved;
      if (currentSaved.includes(retreat.id)) {
        newSaved = currentSaved.filter((id: string) => id !== retreat.id);
        toast({ title: 'Retreat unsaved (Dev Mode)' });
      } else {
        newSaved = [...currentSaved, retreat.id];
        toast({ title: 'Retreat saved! (Dev Mode)' });
      }
      localStorage.setItem('devSavedRetreats', JSON.stringify(newSaved));
      // This is a hack to force re-render in dev mode. A proper context/state manager would be better.
      window.dispatchEvent(new Event('storage'));
      setIsProcessing(false);
      return;
    }

    // Firebase mode
    const userRef = doc(firestore, 'users', user.data.uid);

    try {
      if (isSaved) {
        await updateDoc(userRef, {
          savedRetreatIds: arrayRemove(retreat.id)
        });
        toast({ title: 'Retreat unsaved' });
      } else {
        await updateDoc(userRef, {
          savedRetreatIds: arrayUnion(retreat.id)
        });
        toast({ title: 'Retreat saved!' });
      }
    } catch (error) {
      console.error("Error updating saved retreats:", error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Could not update your saved retreats.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="relative w-full overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/20 flex flex-col h-full">
       <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-9 w-9 rounded-full bg-background/70 hover:bg-background disabled:opacity-70"
        onClick={handleSaveClick}
        disabled={isProcessing}
        aria-label="Save retreat"
      >
        <Bookmark className={cn('h-5 w-5', isSaved ? 'fill-primary text-primary' : 'text-foreground/80')} />
      </Button>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
                <CardTitle className="font-headline text-2xl mb-2 pr-10">{retreat.title}</CardTitle>
                <CardDescription className="flex items-center text-muted-foreground font-ui">
                    <MapPin className="mr-2 h-4 w-4" />
                    {retreat.location}
                </CardDescription>
                 <div className="mt-2 space-y-1 text-xs text-muted-foreground font-ui">
                    {retreat.duration && (
                        <div className="flex items-center">
                            <Clock className="mr-2 h-3 w-3" />
                            <span>{retreat.duration}</span>
                        </div>
                    )}
                    <div className="flex items-center">
                        <CheckCircle className="mr-2 h-3 w-3" />
                        <span>{retreat.included || 'Inclusions vary'}</span>
                    </div>
                </div>
            </div>
            <div className="relative w-20 h-20 shrink-0">
                 <Image
                    src={retreat.image.imageUrl}
                    alt={retreat.image.description}
                    data-ai-hint={retreat.image.imageHint}
                    fill
                    className="object-cover rounded-md"
                />
            </div>
        </div>
        <p className="text-base leading-relaxed line-clamp-2 font-body mb-4">{retreat.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <Button asChild>
            <Link href={`/checkout/${retreat.id}`}>Book Retreat</Link>
        </Button>
        <div className="text-right font-ui">
          <div className="text-lg font-bold text-foreground">
            From ${retreat.price}
            <span className="text-sm font-normal text-muted-foreground"> / night</span>
          </div>
          <p className="text-xs text-muted-foreground">Curated experience</p>
        </div>
      </CardFooter>
    </Card>
  );
}
