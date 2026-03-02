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
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Trash2, Pause, Play } from 'lucide-react';
import { ImageUpload } from '@/components/image-upload';
import { Checkbox } from '@/components/ui/checkbox';

const propertyTypes = [
  'Villa', 'Retreat Center', 'Boutique Hotel', 'Eco-Lodge',
  'Private Estate', 'Beach House', 'Mountain Lodge', 'Farmhouse',
];

const amenityOptions = [
  'Private rooms', 'Pool', 'Yoga shala', "Chef's Kitchen",
  'Ocean access', 'Mountain setting', 'Sauna', 'Wi-Fi',
  'A/C', 'Outdoor space', 'Meditation room', 'Gym / Fitness area',
  'Hot tub / Jacuzzi', 'Garden', 'Parking', 'Laundry',
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

interface SpaceDoc {
  id: string;
  spaceOwnerId: string;
  name: string;
  description: string;
  propertyType: string;
  city: string;
  stateProvince: string;
  country: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  dailyRate: number;
  currency: string;
  amenities?: string[];
  hostVibe?: string;
  spaceImageUrls?: string[];
  status: string;
}

export default function EditSpacePage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.id as string;
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<SpaceDoc | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceSchema),
  });

  useEffect(() => {
    if (!firestore || !spaceId || user.status === 'loading') return;

    if (user.status !== 'authenticated') {
      router.replace('/login');
      return;
    }

    const loadSpace = async () => {
      try {
        const spaceRef = doc(firestore, 'spaces', spaceId);
        const snap = await getDoc(spaceRef);

        if (!snap.exists()) {
          toast({ title: 'Space not found', variant: 'destructive' });
          router.replace('/host/dashboard');
          return;
        }

        const data = snap.data() as SpaceDoc;

        if (data.spaceOwnerId !== user.data!.uid) {
          toast({ title: 'Unauthorized', description: 'You can only edit your own spaces.', variant: 'destructive' });
          router.replace('/host/dashboard');
          return;
        }

        setSpace(data);
        setImages(data.spaceImageUrls || []);
        setSelectedAmenities(data.amenities || []);
        reset({
          name: data.name,
          description: data.description,
          propertyType: data.propertyType,
          city: data.city,
          stateProvince: data.stateProvince,
          country: data.country,
          capacity: data.capacity,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          dailyRate: data.dailyRate,
          currency: data.currency,
          hostVibe: data.hostVibe || '',
        });
      } catch (error) {
        console.error('Error loading space:', error);
        toast({ title: 'Failed to load space', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadSpace();
  }, [firestore, spaceId, user.status]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const saveSpace = async (data: SpaceFormValues, newStatus?: string) => {
    if (!firestore || !space) return;

    setSaving(true);
    try {
      const spaceRef = doc(firestore, 'spaces', spaceId);
      const locationDescription = [data.city, data.stateProvince, data.country].filter(Boolean).join(', ');

      const updates: Record<string, unknown> = {
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
        updatedAt: serverTimestamp(),
      };

      if (newStatus) {
        updates.status = newStatus;
      }

      await updateDoc(spaceRef, updates);

      toast({
        title: 'Space Updated',
        description: newStatus ? `Status changed to ${newStatus}.` : 'Your changes have been saved.',
      });

      router.push('/host/dashboard');
    } catch (error) {
      console.error('Error updating space:', error);
      toast({ title: 'Failed to update', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !space) return;
    if (!confirm('Are you sure you want to delete this space? This cannot be undone.')) return;

    setSaving(true);
    try {
      await deleteDoc(doc(firestore, 'spaces', spaceId));
      toast({ title: 'Space Deleted' });
      router.push('/host/dashboard');
    } catch (error) {
      console.error('Error deleting space:', error);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = () => {
    if (!space) return;
    const newStatus = space.status === 'published' ? 'paused' : 'published';
    handleSubmit((data) => saveSpace(data, newStatus))();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground mt-4">Loading space...</p>
      </div>
    );
  }

  if (!space) return null;

  const statusVariant = space.status === 'published' ? 'default' : space.status === 'paused' ? 'secondary' : 'outline';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit((data) => saveSpace(data))}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-3xl">Edit Space</CardTitle>
                  <CardDescription>Update your property listing details below.</CardDescription>
                </div>
                <Badge variant={statusVariant} className="text-sm capitalize">{space.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input id="name" placeholder="e.g., The Glass House" {...register('name')} />
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
                      <SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger>
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
                  placeholder="Describe your property..."
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
                  <Input id="dailyRate" type="number" min={0} {...register('dailyRate')} />
                  {errors.dailyRate && <p className="text-sm text-destructive">{errors.dailyRate.message}</p>}
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

              {/* Vibe */}
              <div className="space-y-2">
                <Label>Vibe</Label>
                <Controller
                  control={control}
                  name="hostVibe"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger><SelectValue placeholder="How would you describe the vibe?" /></SelectTrigger>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenityOptions.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
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
                  storagePath={`spaces/${spaceId}/gallery`}
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
                  {space.status === 'published'
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
