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

const serviceCategories = [
  'Catering', 'Photography', 'Videography', 'Yoga / Meditation Instruction',
  'Sound Healing', 'Massage / Bodywork', 'Transportation', 'Event Planning',
  'Floral / Decor', 'Music / Entertainment',
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

interface ServiceDoc {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  category: string;
  serviceArea: string;
  startingPrice: number;
  currency: string;
  pricingDetails?: string;
  serviceRadius?: number;
  serviceImageUrls?: string[];
  status: string;
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDoc | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (!firestore || !serviceId || user.status === 'loading') return;

    if (user.status !== 'authenticated') {
      router.replace('/login');
      return;
    }

    const loadService = async () => {
      try {
        const serviceRef = doc(firestore, 'services', serviceId);
        const snap = await getDoc(serviceRef);

        if (!snap.exists()) {
          toast({ title: 'Service not found', variant: 'destructive' });
          router.replace('/vendor/dashboard');
          return;
        }

        const data = snap.data() as ServiceDoc;

        if (data.vendorId !== user.data!.uid) {
          toast({ title: 'Unauthorized', description: 'You can only edit your own services.', variant: 'destructive' });
          router.replace('/vendor/dashboard');
          return;
        }

        setService(data);
        setImages(data.serviceImageUrls || []);
        reset({
          name: data.name,
          description: data.description,
          category: data.category,
          serviceArea: data.serviceArea,
          startingPrice: data.startingPrice,
          currency: data.currency,
          pricingDetails: data.pricingDetails || '',
          serviceRadius: data.serviceRadius || 0,
        });
      } catch (error) {
        console.error('Error loading service:', error);
        toast({ title: 'Failed to load service', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [firestore, serviceId, user.status]);

  const saveService = async (data: ServiceFormValues, newStatus?: string) => {
    if (!firestore || !service) return;

    setSaving(true);
    try {
      const serviceRef = doc(firestore, 'services', serviceId);
      const updates: Record<string, unknown> = {
        name: data.name,
        description: data.description,
        category: data.category,
        serviceArea: data.serviceArea,
        startingPrice: data.startingPrice,
        currency: data.currency,
        pricingDetails: data.pricingDetails || '',
        serviceRadius: data.serviceRadius || 0,
        serviceImageUrls: images,
        updatedAt: serverTimestamp(),
      };

      if (newStatus) {
        updates.status = newStatus;
      }

      await updateDoc(serviceRef, updates);

      toast({
        title: 'Service Updated',
        description: newStatus ? `Status changed to ${newStatus}.` : 'Your changes have been saved.',
      });

      router.push('/vendor/dashboard');
    } catch (error) {
      console.error('Error updating service:', error);
      toast({ title: 'Failed to update', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !service) return;
    if (!confirm('Are you sure you want to delete this service? This cannot be undone.')) return;

    setSaving(true);
    try {
      await deleteDoc(doc(firestore, 'services', serviceId));
      toast({ title: 'Service Deleted' });
      router.push('/vendor/dashboard');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = () => {
    if (!service) return;
    const newStatus = service.status === 'active' ? 'paused' : 'active';
    handleSubmit((data) => saveService(data, newStatus))();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground mt-4">Loading service...</p>
      </div>
    );
  }

  if (!service) return null;

  const statusVariant = service.status === 'active' ? 'default' : service.status === 'paused' ? 'secondary' : 'outline';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit((data) => saveService(data))}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-3xl">Edit Service</CardTitle>
                  <CardDescription>Update your service listing details below.</CardDescription>
                </div>
                <Badge variant={statusVariant} className="text-sm capitalize">{service.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input id="name" placeholder="e.g., Holistic Catering for Retreats" {...register('name')} />
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
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
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
                  <Input id="serviceArea" placeholder="e.g., Bali, Indonesia" {...register('serviceArea')} />
                  {errors.serviceArea && <p className="text-sm text-destructive">{errors.serviceArea.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                  <Input id="serviceRadius" type="number" min={0} {...register('serviceRadius')} />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service..."
                  className="min-h-[120px]"
                  {...register('description')}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startingPrice">Starting Price *</Label>
                  <Input id="startingPrice" type="number" min={0} {...register('startingPrice')} />
                  {errors.startingPrice && <p className="text-sm text-destructive">{errors.startingPrice.message}</p>}
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

              {/* Pricing Details */}
              <div className="space-y-2">
                <Label htmlFor="pricingDetails">Pricing Details</Label>
                <Textarea id="pricingDetails" placeholder="e.g., Per event pricing, custom packages available." {...register('pricingDetails')} />
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
                  storagePath={`services/${serviceId}/gallery`}
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
                  {service.status === 'active'
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
