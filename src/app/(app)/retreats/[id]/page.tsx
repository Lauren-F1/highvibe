'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { allRetreats as mockRetreats } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, CheckCircle, Users, DollarSign, Bookmark, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { isFirebaseEnabled } from '@/firebase/config';
import { format, parseISO } from 'date-fns';

interface RetreatDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  duration?: string;
  included?: string;
  type?: string[];
  // Firestore retreat fields
  hostId?: string;
  guideName?: string;
  guideAvatar?: string;
  capacity?: number;
  currentAttendees?: number;
  spotsRemaining?: number;
  isFullyBooked?: boolean;
  startDate?: string;
  endDate?: string;
  currency?: string;
  retreatImageUrls?: string[];
  locationDescription?: string;
  costPerPerson?: number;
  guideId?: string;
}

export default function RetreatDetailPage() {
  const params = useParams();
  const retreatId = params.id as string;
  const firestore = useFirestore();
  const user = useUser();
  const { toast } = useToast();

  const [retreat, setRetreat] = useState<RetreatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  const isSaved = user.status === 'authenticated' && user.profile?.savedRetreatIds?.includes(retreatId) || false;

  useEffect(() => {
    const loadRetreat = async () => {
      // Try Firestore first
      if (firestore) {
        try {
          const retreatDoc = await getDoc(doc(firestore, 'retreats', retreatId));
          if (retreatDoc.exists()) {
            const data = retreatDoc.data();
            setRetreat({
              id: retreatDoc.id,
              title: data.title || '',
              description: data.description || '',
              location: data.locationDescription || '',
              price: data.costPerPerson || 0,
              rating: 0,
              image: data.retreatImageUrls?.[0] || '/generic-placeholder.png',
              duration: data.startDate && data.endDate
                ? `${format(parseISO(data.startDate), 'MMM d')} – ${format(parseISO(data.endDate), 'MMM d, yyyy')}`
                : undefined,
              included: data.included || '',
              type: data.type ? [data.type] : [],
              hostId: data.hostId,
              guideId: data.guideId,
              capacity: data.capacity,
              currentAttendees: data.currentAttendees || 0,
              spotsRemaining: data.spotsRemaining,
              isFullyBooked: data.isFullyBooked || false,
              startDate: data.startDate,
              endDate: data.endDate,
              currency: data.currency || 'USD',
              retreatImageUrls: data.retreatImageUrls || [],
              costPerPerson: data.costPerPerson,
              locationDescription: data.locationDescription,
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading retreat from Firestore:', error);
        }
      }

      // Fallback to mock data
      const mock = mockRetreats.find(r => r.id === retreatId);
      if (mock) {
        setRetreat({
          ...mock,
          type: mock.type || [],
        });
      }
      setLoading(false);
    };

    loadRetreat();
  }, [retreatId, firestore]);

  const handleSaveClick = async () => {
    setSavingBookmark(true);

    if (user.status !== 'authenticated' || (!firestore && isFirebaseEnabled)) {
      toast({ title: 'Please log in to save retreats' });
      setSavingBookmark(false);
      return;
    }

    if (!isFirebaseEnabled) {
      const currentSaved = JSON.parse(localStorage.getItem('devSavedRetreats') || '[]');
      const newSaved = currentSaved.includes(retreatId)
        ? currentSaved.filter((id: string) => id !== retreatId)
        : [...currentSaved, retreatId];
      localStorage.setItem('devSavedRetreats', JSON.stringify(newSaved));
      window.dispatchEvent(new Event('storage'));
      toast({ title: isSaved ? 'Retreat unsaved' : 'Retreat saved!' });
      setSavingBookmark(false);
      return;
    }

    const userRef = doc(firestore, 'users', user.data.uid);
    try {
      if (isSaved) {
        await updateDoc(userRef, { savedRetreatIds: arrayRemove(retreatId) });
        toast({ title: 'Retreat unsaved' });
      } else {
        await updateDoc(userRef, { savedRetreatIds: arrayUnion(retreatId) });
        toast({ title: 'Retreat saved!' });
      }
    } catch (error) {
      console.error('Error updating saved retreats:', error);
      toast({ variant: 'destructive', title: 'Something went wrong' });
    } finally {
      setSavingBookmark(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading retreat details...</div>;
  }

  if (!retreat) {
    notFound();
  }

  const images = retreat.retreatImageUrls?.length ? retreat.retreatImageUrls : [retreat.image];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      {/* Hero image */}
      <div className="relative w-full h-[300px] md:h-[420px] rounded-xl overflow-hidden mb-8">
        <Image
          src={images[0]}
          alt={retreat.title}
          fill
          className="object-cover"
          priority
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
          onClick={handleSaveClick}
          disabled={savingBookmark}
        >
          <Bookmark className={cn('h-5 w-5', isSaved ? 'fill-primary text-primary' : 'text-foreground/80')} />
        </Button>
      </div>

      {/* Image gallery (if more than 1 image) */}
      {images.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="relative h-24 md:h-32 rounded-lg overflow-hidden">
              <Image src={img} alt={`${retreat.title} photo ${i + 2}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{retreat.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {retreat.locationDescription || retreat.location}
              </span>
              {retreat.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {retreat.duration}
                </span>
              )}
              {retreat.capacity && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Up to {retreat.capacity} guests
                </span>
              )}
            </div>
          </div>

          {retreat.type && retreat.type.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {retreat.type.map(t => (
                <Badge key={t} variant="secondary" className="capitalize">{t.replace(/-/g, ' ')}</Badge>
              ))}
            </div>
          )}

          <Separator />

          <div>
            <h2 className="font-headline text-xl font-semibold mb-3">About This Retreat</h2>
            <p className="text-base leading-relaxed font-body whitespace-pre-line">
              {retreat.description}
            </p>
          </div>

          {retreat.included && (
            <>
              <Separator />
              <div>
                <h2 className="font-headline text-xl font-semibold mb-3">What's Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {retreat.included.split(',').map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-beige shrink-0" />
                      <span className="text-sm">{item.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {retreat.startDate && retreat.endDate && (
            <>
              <Separator />
              <div>
                <h2 className="font-headline text-xl font-semibold mb-3">Dates</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{format(parseISO(retreat.startDate), 'MMMM d, yyyy')} – {format(parseISO(retreat.endDate), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-headline text-2xl">
                  ${retreat.costPerPerson || retreat.price}
                  <span className="text-sm font-normal text-muted-foreground"> / {retreat.costPerPerson ? 'person' : 'night'}</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {retreat.duration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {retreat.duration}
                </div>
              )}
              {retreat.capacity != null && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {retreat.isFullyBooked
                    ? 'Fully booked'
                    : retreat.spotsRemaining != null
                      ? `${retreat.spotsRemaining} of ${retreat.capacity} spots remaining`
                      : `Up to ${retreat.capacity} guests`
                  }
                </div>
              )}
              <Separator />
              {retreat.isFullyBooked ? (
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  disabled={joiningWaitlist || waitlistJoined || user.status !== 'authenticated'}
                  onClick={async () => {
                    if (!firestore || user.status !== 'authenticated') return;
                    setJoiningWaitlist(true);
                    try {
                      await addDoc(collection(firestore, 'retreat_interest'), {
                        retreatId: retreat.id,
                        seekerId: user.data.uid,
                        guideId: retreat.guideId || retreat.hostId || '',
                        createdAt: serverTimestamp(),
                      });
                      setWaitlistJoined(true);
                      toast({ title: 'Added to waitlist', description: "We'll notify you if a spot opens up." });
                    } catch {
                      toast({ variant: 'destructive', title: 'Could not join waitlist' });
                    } finally {
                      setJoiningWaitlist(false);
                    }
                  }}
                >
                  {waitlistJoined ? 'On Waitlist' : joiningWaitlist ? 'Joining...' : 'Join Waitlist'}
                </Button>
              ) : (
                <Button asChild className="w-full" size="lg">
                  <Link href={`/checkout/${retreat.id}`}>Book This Retreat</Link>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSaveClick}
                disabled={savingBookmark}
              >
                <Bookmark className={cn('mr-2 h-4 w-4', isSaved ? 'fill-primary text-primary' : '')} />
                {isSaved ? 'Saved' : 'Save for Later'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
