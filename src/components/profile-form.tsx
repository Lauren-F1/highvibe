'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserProfile } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/image-upload';
import { vendorCategories } from '@/lib/mock-data';
import { Checkbox } from './ui/checkbox';

const profileSchema = z.object({
    displayName: z.string().min(2, 'Display name is required'),
    profileSlug: z.string().min(3, 'Profile URL slug is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed.'),
    headline: z.string().max(80).optional(),
    bio: z.string().max(600).optional(),
    locationLabel: z.string().optional(),
    isWillingToTravel: z.boolean().default(false),
    travelRadiusMiles: z.number().min(0).max(500).default(0),
    avatarUrl: z.string().url().optional(),
    galleryUrls: z.array(z.string().url()).max(6).optional(),
    
    // Vendor fields
    vendorCategories: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    userProfile: UserProfile;
    userId: string;
}

export function ProfileForm({ userProfile, userId }: ProfileFormProps) {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: userProfile.displayName || '',
            profileSlug: userProfile.profileSlug || '',
            headline: userProfile.headline || '',
            bio: userProfile.bio || '',
            locationLabel: userProfile.locationLabel || '',
            isWillingToTravel: userProfile.isWillingToTravel || false,
            travelRadiusMiles: userProfile.travelRadiusMiles || 0,
            avatarUrl: userProfile.avatarUrl || '',
            galleryUrls: userProfile.galleryUrls || [],
            vendorCategories: userProfile.vendorCategories || [],
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        if (!firestore) return;

        const userDocRef = doc(firestore, 'users', userId);
        try {
            await updateDoc(userDocRef, {
                ...data,
                profileComplete: true,
            });
            toast({ title: 'Profile updated successfully!' });
            router.push('/account');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Error updating profile',
                description: 'Please try again.',
                variant: 'destructive',
            });
        }
    };

    const isVendor = userProfile.roles?.includes('vendor');
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profile Picture</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    storagePath={`users/${userId}/avatar.jpg`}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="profileSlug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profile URL</FormLabel>
                            <div className="flex items-center">
                                <span className="text-sm text-muted-foreground p-2 bg-muted rounded-l-md border border-r-0">retreat.com/u/</span>
                                <FormControl><Input {...field} className="rounded-l-none" /></FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Headline</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g. Yoga Instructor & Sound Healer" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl><Textarea {...field} rows={5} placeholder="Tell us about yourself..." /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="locationLabel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g. Bali, Indonesia" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="isWillingToTravel"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Willing to Travel?</FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {form.watch('isWillingToTravel') && (
                    <FormField
                        control={form.control}
                        name="travelRadiusMiles"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Travel Radius: {field.value} miles</FormLabel>
                                <FormControl>
                                    <Slider
                                        value={[field.value]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                        max={500}
                                        step={25}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}
                
                <FormField
                    control={form.control}
                    name="galleryUrls"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gallery (up to 6 images)</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    storagePath={`users/${userId}/gallery/`}
                                    multiple
                                    maxFiles={6}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isVendor && (
                  <div>
                    <h3 className="text-lg font-medium">Vendor Profile</h3>
                    <div className="mt-4 space-y-8">
                       <FormField
                          control={form.control}
                          name="vendorCategories"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel className="text-base">Vendor Categories</FormLabel>
                              </div>
                              {vendorCategories.map((item) => (
                                <FormField
                                  key={item.name}
                                  control={form.control}
                                  name="vendorCategories"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item.name}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(item.name)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), item.name])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== item.name
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {item.name}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                  </div>
                )}


                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>
            </form>
        </Form>
    );
}
