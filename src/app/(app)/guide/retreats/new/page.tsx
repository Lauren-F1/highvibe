'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { doc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Save, Send, Sparkles } from 'lucide-react';
import { generateRetreatDescription } from '@/ai/flows/retreat-description-generator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/image-upload';

const retreatTypes = [
  'Yoga',
  'Meditation',
  'Wellness',
  'Adventure',
  'Creative Arts',
  'Spiritual',
  'Fitness',
  'Nature Immersion',
  'Culinary',
  'Mindfulness',
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

export default function NewRetreatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RetreatFormValues>({
    resolver: zodResolver(retreatSchema),
    defaultValues: {
      currency: 'USD',
      capacity: 10,
      costPerPerson: 0,
    },
  });

  const handleGenerateDescription = async () => {
    const title = watch('title');
    const retreatType = watch('type');

    if (!title && !retreatType) {
      toast({ title: 'Enter a retreat name or select a type first', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    try {
      const result = await generateRetreatDescription({
        keywords: title || 'retreat',
        retreatType: retreatType || 'Wellness',
      });
      setValue('description', result.description, { shouldValidate: true });
      toast({ title: 'Description generated!' });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({ title: 'Failed to generate description', description: 'Please try again or write your own.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const saveRetreat = async (data: RetreatFormValues, status: 'draft' | 'published') => {
    if (user.status !== 'authenticated' || !firestore) {
      toast({ title: 'Please log in to create a retreat.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      const retreatRef = doc(collection(firestore, 'retreats'));
      const payload = {
        id: retreatRef.id,
        hostId: user.data!.uid,
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        costPerPerson: data.costPerPerson,
        currency: data.currency,
        capacity: data.capacity,
        currentAttendees: 0,
        locationDescription: data.locationDescription,
        included: data.included || '',
        status,
        vendorIds: [],
        retreatImageUrls: images,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(retreatRef, payload);

      toast({
        title: status === 'draft' ? 'Draft Saved' : 'Retreat Published!',
        description: status === 'draft'
          ? 'Your retreat has been saved as a draft. You can edit and publish it later.'
          : 'Your retreat is now live. Start finding partners!',
      });

      router.push('/guide');
    } catch (error) {
      console.error('Error saving retreat:', error);
      toast({
        title: 'Failed to save retreat',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit((data) => saveRetreat(data, 'published'))}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Create a New Retreat</CardTitle>
              <CardDescription>
                Fill in the details below to get started. You can save as a draft and come back later, or publish right away to start matching with hosts and vendors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Retreat Name *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Sunrise Yoga in Bali"
                  {...register('title')}
                />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
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
                <Input
                  id="locationDescription"
                  placeholder="e.g., Bali, Indonesia"
                  {...register('locationDescription')}
                />
                {errors.locationDescription && <p className="text-sm text-destructive">{errors.locationDescription.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={generating}
                  >
                    {generating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
                    {generating ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe your retreat's vision, activities, and what makes it special..."
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
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
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
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
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
                  <Input
                    id="costPerPerson"
                    type="number"
                    min={0}
                    placeholder="e.g., 1200"
                    {...register('costPerPerson')}
                  />
                  {errors.costPerPerson && <p className="text-sm text-destructive">{errors.costPerPerson.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Currency *</Label>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
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
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={500}
                  placeholder="e.g., 15"
                  {...register('capacity')}
                />
                <p className="text-xs text-muted-foreground">Maximum number of attendees</p>
                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
              </div>

              {/* What's Included */}
              <div className="space-y-2">
                <Label htmlFor="included">What&apos;s Included</Label>
                <Textarea
                  id="included"
                  placeholder="e.g., Lodging, all meals, daily yoga sessions, airport transfers"
                  {...register('included')}
                />
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
                  storagePath={`retreats/new/gallery`}
                  multiple
                  maxFiles={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={saving}
                onClick={handleSubmit((data) => saveRetreat(data, 'draft'))}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save as Draft
              </Button>
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Publish Retreat
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
