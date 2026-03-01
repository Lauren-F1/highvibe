'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Loader2, Save, Send, Trash2, Pause, Play } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/image-upload';

const retreatTypes = [
  'Yoga', 'Meditation', 'Wellness', 'Adventure', 'Creative Arts',
  'Spiritual', 'Fitness', 'Nature Immersion', 'Culinary', 'Mindfulness',
];

const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD'];

const retreatSchema = z.object({
  title: z.string().min(3, 'Retreat name must be at least 3 characters'),
  description: z.string().min(20, 'Please provide a more detailed description (at least 20 characters)'),
  type: z.string().min(1, 'Please select a retreat type'),
  locationDescription: z.string().min(2, 'Please enter a destination'),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  costPerPerson: z.coerce.number().min(1, 'Price must be at least $1'),
  currency: z.string().min(1, 'Please select a currency'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(500, 'Capacity cannot exceed 500'),
  included: z.string().optional(),
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type RetreatFormValues = z.infer<typeof retreatSchema>;

interface RetreatDoc {
  id: string;
  hostId: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  costPerPerson: number;
  currency: string;
  capacity: number;
  locationDescription: string;
  included?: string;
  retreatImageUrls?: string[];
  status: string;
}

export default function EditRetreatPage() {
  const router = useRouter();
  const params = useParams();
  const retreatId = params.id as string;
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retreat, setRetreat] = useState<RetreatDoc | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RetreatFormValues>({
    resolver: zodResolver(retreatSchema),
  });

  useEffect(() => {
    if (!firestore || !retreatId || user.status === 'loading') return;

    if (user.status !== 'authenticated') {
      router.replace('/login');
      return;
    }

    const loadRetreat = async () => {
      try {
        const retreatRef = doc(firestore, 'retreats', retreatId);
        const snap = await getDoc(retreatRef);

        if (!snap.exists()) {
          toast({ title: 'Retreat not found', variant: 'destructive' });
          router.replace('/guide');
          return;
        }

        const data = snap.data() as RetreatDoc;

        if (data.hostId !== user.data!.uid) {
          toast({ title: 'Unauthorized', description: 'You can only edit your own retreats.', variant: 'destructive' });
          router.replace('/guide');
          return;
        }

        setRetreat(data);
        setImages(data.retreatImageUrls || []);
        reset({
          title: data.title,
          description: data.description,
          type: data.type,
          locationDescription: data.locationDescription,
          startDate: parseISO(data.startDate),
          endDate: parseISO(data.endDate),
          costPerPerson: data.costPerPerson,
          currency: data.currency,
          capacity: data.capacity,
          included: data.included || '',
        });
      } catch (error) {
        console.error('Error loading retreat:', error);
        toast({ title: 'Failed to load retreat', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadRetreat();
  }, [firestore, retreatId, user.status]);

  const saveRetreat = async (data: RetreatFormValues, newStatus?: string) => {
    if (!firestore || !retreat) return;

    setSaving(true);
    try {
      const retreatRef = doc(firestore, 'retreats', retreatId);
      const updates: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        type: data.type,
        locationDescription: data.locationDescription,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        costPerPerson: data.costPerPerson,
        currency: data.currency,
        capacity: data.capacity,
        included: data.included || '',
        retreatImageUrls: images,
        updatedAt: serverTimestamp(),
      };

      if (newStatus) {
        updates.status = newStatus;
      }

      await updateDoc(retreatRef, updates);

      toast({
        title: 'Retreat Updated',
        description: newStatus ? `Status changed to ${newStatus}.` : 'Your changes have been saved.',
      });

      // Navigate back to dashboard after saving
      router.push('/guide');
    } catch (error) {
      console.error('Error updating retreat:', error);
      toast({ title: 'Failed to update', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !retreat) return;
    if (!confirm('Are you sure you want to delete this retreat? This cannot be undone.')) return;

    setSaving(true);
    try {
      await deleteDoc(doc(firestore, 'retreats', retreatId));
      toast({ title: 'Retreat Deleted' });
      router.push('/guide');
    } catch (error) {
      console.error('Error deleting retreat:', error);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = () => {
    if (!retreat) return;
    const newStatus = retreat.status === 'published' ? 'paused' : 'published';
    handleSubmit((data) => saveRetreat(data, newStatus))();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground mt-4">Loading retreat...</p>
      </div>
    );
  }

  if (!retreat) return null;

  const statusVariant = retreat.status === 'published' ? 'default' : retreat.status === 'paused' ? 'secondary' : 'outline';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit((data) => saveRetreat(data))}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-3xl">Edit Retreat</CardTitle>
                  <CardDescription>Update your retreat details below.</CardDescription>
                </div>
                <Badge variant={statusVariant} className="text-sm capitalize">{retreat.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Retreat Name *</Label>
                <Input id="title" placeholder="e.g., Sunrise Yoga in Bali" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Retreat Type *</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>
                        {retreatTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="locationDescription">Destination *</Label>
                <Input id="locationDescription" placeholder="e.g., Bali, Indonesia" {...register('locationDescription')} />
                {errors.locationDescription && <p className="text-sm text-destructive">{errors.locationDescription.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your retreat..."
                  className="min-h-[120px]"
                  {...register('description')}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
                </div>
              </div>

              {/* Price + Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPerPerson">Price per Person *</Label>
                  <Input id="costPerPerson" type="number" min={0} {...register('costPerPerson')} />
                  {errors.costPerPerson && <p className="text-sm text-destructive">{errors.costPerPerson.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Currency *</Label>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                        <SelectContent>
                          {currencies.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">Max Capacity *</Label>
                <Input id="capacity" type="number" min={1} max={500} {...register('capacity')} />
                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
              </div>

              {/* What's Included */}
              <div className="space-y-2">
                <Label htmlFor="included">What&apos;s Included</Label>
                <Textarea id="included" placeholder="e.g., Lodging, all meals, daily yoga sessions" {...register('included')} />
              </div>

              {/* Retreat Images */}
              <div className="space-y-2">
                <Label>Retreat Images</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Add photos that showcase your retreat experience. Up to 6 images.
                </p>
                <ImageUpload
                  value={images}
                  onChange={(val) => setImages(Array.isArray(val) ? val : [val])}
                  storagePath={`retreats/${retreatId}/gallery`}
                  multiple
                  maxFiles={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 justify-between">
              <div className="flex gap-3">
                <Button type="submit" size="lg" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
                <Button type="button" variant="outline" size="lg" disabled={saving} onClick={toggleStatus}>
                  {retreat.status === 'published'
                    ? <><Pause className="mr-2 h-4 w-4" /> Pause</>
                    : <><Play className="mr-2 h-4 w-4" /> Publish</>
                  }
                </Button>
              </div>
              <Button type="button" variant="destructive" size="lg" disabled={saving} onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
