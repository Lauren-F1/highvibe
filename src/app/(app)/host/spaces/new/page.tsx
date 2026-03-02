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
import { Loader2, Save, Send } from 'lucide-react';
import { ImageUpload } from '@/components/image-upload';
import { Checkbox } from '@/components/ui/checkbox';

const propertyTypes = [
  'Villa',
  'Retreat Center',
  'Boutique Hotel',
  'Eco-Lodge',
  'Private Estate',
  'Beach House',
  'Mountain Lodge',
  'Farmhouse',
];

const amenityOptions = [
  'Private rooms',
  'Pool',
  'Yoga shala',
  "Chef's Kitchen",
  'Ocean access',
  'Mountain setting',
  'Sauna',
  'Wi-Fi',
  'A/C',
  'Outdoor space',
  'Meditation room',
  'Gym / Fitness area',
  'Hot tub / Jacuzzi',
  'Garden',
  'Parking',
  'Laundry',
];

const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD'];

const spaceSchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  description: z.string().min(20, 'Please provide a more detailed description (at least 20 characters)'),
  propertyType: z.string().min(1, 'Please select a property type'),
  city: z.string().min(2, 'Please enter a city'),
  stateProvince: z.string().min(1, 'Please enter a state or province'),
  country: z.string().min(2, 'Please enter a country'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(500, 'Capacity cannot exceed 500'),
  bedrooms: z.coerce.number().min(0, 'Must be 0 or more'),
  bathrooms: z.coerce.number().min(0, 'Must be 0 or more'),
  dailyRate: z.coerce.number().min(1, 'Rate must be at least $1'),
  currency: z.string().min(1, 'Please select a currency'),
  hostVibe: z.string().optional(),
});

type SpaceFormValues = z.infer<typeof spaceSchema>;

export default function NewSpacePage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      currency: 'USD',
      capacity: 10,
      bedrooms: 0,
      bathrooms: 0,
      dailyRate: 0,
    },
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const saveSpace = async (data: SpaceFormValues, status: 'draft' | 'published') => {
    if (user.status !== 'authenticated' || !firestore) {
      toast({ title: 'Please log in to list a space.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      const spaceRef = doc(collection(firestore, 'spaces'));
      const locationDescription = [data.city, data.stateProvince, data.country].filter(Boolean).join(', ');

      const payload = {
        id: spaceRef.id,
        spaceOwnerId: user.data!.uid,
        name: data.name,
        description: data.description,
        propertyType: data.propertyType,
        city: data.city,
        stateProvince: data.stateProvince,
        country: data.country,
        locationDescription,
        capacity: data.capacity,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        dailyRate: data.dailyRate,
        currency: data.currency,
        amenities: selectedAmenities,
        hostVibe: data.hostVibe || '',
        spaceImageUrls: images,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(spaceRef, payload);

      toast({
        title: status === 'draft' ? 'Draft Saved' : 'Space Published!',
        description: status === 'draft'
          ? 'Your space has been saved as a draft. You can edit and publish it later.'
          : 'Your space is now live and visible to retreat guides!',
      });

      router.push('/host/dashboard');
    } catch (error) {
      console.error('Error saving space:', error);
      toast({
        title: 'Failed to save space',
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
        <form onSubmit={handleSubmit((data) => saveSpace(data, 'published'))}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">List Your Space</CardTitle>
              <CardDescription>
                Share your property with retreat guides looking for the perfect venue. Fill in the details below, then save as a draft or publish right away.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., The Glass House"
                  {...register('name')}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label>Property Type *</Label>
                <Controller
                  control={control}
                  name="propertyType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.propertyType && <p className="text-sm text-destructive">{errors.propertyType.message}</p>}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="e.g., Topanga" {...register('city')} />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateProvince">State / Province *</Label>
                  <Input id="stateProvince" placeholder="e.g., California" {...register('stateProvince')} />
                  {errors.stateProvince && <p className="text-sm text-destructive">{errors.stateProvince.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" placeholder="e.g., United States" {...register('country')} />
                  {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property, its setting, and what makes it ideal for retreats..."
                  className="min-h-[120px]"
                  {...register('description')}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              {/* Capacity, Bedrooms, Bathrooms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Guest Capacity *</Label>
                  <Input id="capacity" type="number" min={1} max={500} {...register('capacity')} />
                  {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" min={0} {...register('bedrooms')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" min={0} {...register('bathrooms')} />
                </div>
              </div>

              {/* Rate + Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Rate per Night *</Label>
                  <Input id="dailyRate" type="number" min={0} placeholder="e.g., 2200" {...register('dailyRate')} />
                  {errors.dailyRate && <p className="text-sm text-destructive">{errors.dailyRate.message}</p>}
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

              {/* Vibe */}
              <div className="space-y-2">
                <Label>Vibe</Label>
                <Controller
                  control={control}
                  name="hostVibe"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="How would you describe the vibe?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quiet + Restorative">Quiet + Restorative</SelectItem>
                        <SelectItem value="Luxury + Elevated">Luxury + Elevated</SelectItem>
                        <SelectItem value="Adventure + Outdoors">Adventure + Outdoors</SelectItem>
                        <SelectItem value="Community + Social">Community + Social</SelectItem>
                        <SelectItem value="Spiritual + Sacred">Spiritual + Sacred</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select all amenities your space offers.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenityOptions.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Space Images */}
              <div className="space-y-2">
                <Label>Property Photos</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Add photos that showcase your space. Up to 6 images recommended.
                </p>
                <ImageUpload
                  value={images}
                  onChange={(val) => setImages(Array.isArray(val) ? val : [val])}
                  storagePath={`spaces/new/gallery`}
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
                onClick={handleSubmit((data) => saveSpace(data, 'draft'))}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save as Draft
              </Button>
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Publish Space
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
