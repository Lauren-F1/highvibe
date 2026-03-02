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

const serviceCategories = [
  'Catering',
  'Photography',
  'Videography',
  'Yoga / Meditation Instruction',
  'Sound Healing',
  'Massage / Bodywork',
  'Transportation',
  'Event Planning',
  'Floral / Decor',
  'Music / Entertainment',
];

const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD'];

const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters'),
  description: z.string().min(20, 'Please provide a more detailed description (at least 20 characters)'),
  category: z.string().min(1, 'Please select a category'),
  serviceArea: z.string().min(2, 'Please enter your service area'),
  startingPrice: z.coerce.number().min(1, 'Starting price must be at least $1'),
  currency: z.string().min(1, 'Please select a currency'),
  pricingDetails: z.string().optional(),
  serviceRadius: z.coerce.number().min(0).optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function NewServicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      currency: 'USD',
      startingPrice: 0,
      serviceRadius: 50,
    },
  });

  const saveService = async (data: ServiceFormValues, status: 'draft' | 'active') => {
    if (user.status !== 'authenticated' || !firestore) {
      toast({ title: 'Please log in to add a service.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      const serviceRef = doc(collection(firestore, 'services'));
      const payload = {
        id: serviceRef.id,
        vendorId: user.data!.uid,
        name: data.name,
        description: data.description,
        category: data.category,
        serviceArea: data.serviceArea,
        startingPrice: data.startingPrice,
        currency: data.currency,
        pricingDetails: data.pricingDetails || '',
        serviceRadius: data.serviceRadius || 0,
        serviceImageUrls: images,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(serviceRef, payload);

      toast({
        title: status === 'draft' ? 'Draft Saved' : 'Service Published!',
        description: status === 'draft'
          ? 'Your service has been saved as a draft. You can edit and publish it later.'
          : 'Your service is now live and visible to guides and hosts!',
      });

      router.push('/vendor/dashboard');
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Failed to save service',
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
        <form onSubmit={handleSubmit((data) => saveService(data, 'active'))}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Add a New Service</CardTitle>
              <CardDescription>
                Describe what you offer so retreat guides and hosts can find and book you. Save as a draft or publish right away.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Holistic Catering for Retreats"
                  {...register('name')}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>

              {/* Service Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceArea">Service Area *</Label>
                  <Input
                    id="serviceArea"
                    placeholder="e.g., Bali, Indonesia or Global"
                    {...register('serviceArea')}
                  />
                  {errors.serviceArea && <p className="text-sm text-destructive">{errors.serviceArea.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                  <Input
                    id="serviceRadius"
                    type="number"
                    min={0}
                    placeholder="e.g., 50"
                    {...register('serviceRadius')}
                  />
                  <p className="text-xs text-muted-foreground">Leave 0 for global / remote services</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service, what's included, and what makes it special..."
                  className="min-h-[120px]"
                  {...register('description')}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startingPrice">Starting Price *</Label>
                  <Input
                    id="startingPrice"
                    type="number"
                    min={0}
                    placeholder="e.g., 1500"
                    {...register('startingPrice')}
                  />
                  {errors.startingPrice && <p className="text-sm text-destructive">{errors.startingPrice.message}</p>}
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

              {/* Pricing Details */}
              <div className="space-y-2">
                <Label htmlFor="pricingDetails">Pricing Details</Label>
                <Textarea
                  id="pricingDetails"
                  placeholder="e.g., Per event pricing, custom packages available. Group discounts for 20+ guests."
                  {...register('pricingDetails')}
                />
              </div>

              {/* Service Images */}
              <div className="space-y-2">
                <Label>Service Photos</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Add photos that showcase your work. Up to 6 images.
                </p>
                <ImageUpload
                  value={images}
                  onChange={(val) => setImages(Array.isArray(val) ? val : [val])}
                  storagePath={`services/new/gallery`}
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
                onClick={handleSubmit((data) => saveService(data, 'draft'))}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save as Draft
              </Button>
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Publish Service
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
