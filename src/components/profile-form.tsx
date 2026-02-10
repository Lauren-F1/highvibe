'use client';

import { useForm } from 'react-hook-form';
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
import { vendorCategories, hostAmenities, hostVibes } from '@/lib/mock-data';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const profileSchema = z.object({
    displayName: z.string().min(2, 'Display name is required'),
    profileSlug: z.string().min(3, 'Profile URL slug is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed.'),
    headline: z.string().max(80).optional(),
    bio: z.string().max(600).optional(),
    locationLabel: z.string().optional(),
    isWillingToTravel: z.boolean().default(false),
    travelRadiusMiles: z.number().min(0).max(500).default(0),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    galleryUrls: z.array(z.string().url()).max(6).optional(),
    
    // Vendor fields
    vendorCategories: z.array(z.string()).optional(),
    vendorWebsite: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    instagramUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    offerings: z.string().optional(),
    portfolioUrls: z.array(z.string().url()).max(8).optional(),
    serviceRadiusMiles: z.number().min(0).max(1000).optional(),

    // Host fields
    hostAmenities: z.array(z.string()).optional(),
    hostVibe: z.string().optional(),
    propertyShowcaseUrls: z.array(z.string().url()).max(10).optional(),
    typicalCapacity: z.coerce.number().min(0).optional(),
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
            vendorWebsite: userProfile.vendorWebsite || '',
            instagramUrl: userProfile.instagramUrl || '',
            offerings: userProfile.offerings?.join(', ') || '',
            portfolioUrls: userProfile.portfolioUrls || [],
            serviceRadiusMiles: userProfile.serviceRadiusMiles || 0,
            hostAmenities: userProfile.hostAmenities || [],
            hostVibe: userProfile.hostVibe || '',
            propertyShowcaseUrls: userProfile.propertyShowcaseUrls || [],
            typicalCapacity: userProfile.typicalCapacity || 0,
        },
    });
    
    const { formState: { isDirty, isSubmitting } } = form;

    const onSubmit = async (data: ProfileFormValues) => {
        if (!firestore) return;
        
        const offeringsArray = data.offerings ? data.offerings.split(',').map(s => s.trim()).filter(Boolean) : [];

        const userDocRef = doc(firestore, 'users', userId);
        try {
            await updateDoc(userDocRef, {
                ...data,
                offerings: offeringsArray,
                profileComplete: true,
            });
            toast({ title: 'Profile updated successfully!' });
            router.push('/account');
            router.refresh(); // to ensure server components get new data
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
    const isHost = userProfile.roles?.includes('host');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 {isDirty && (
                    <div className="fixed top-28 right-8 z-20">
                        <Button type="submit" disabled={isSubmitting} size="lg">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
                
                <Accordion type="multiple" defaultValue={['basics']} className="w-full">
                    <AccordionItem value="basics">
                        <AccordionTrigger className="text-2xl font-headline">Basics</AccordionTrigger>
                        <AccordionContent className="pt-6 space-y-8">
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
                                            <span className="text-sm text-muted-foreground p-2 bg-muted rounded-l-md border border-r-0">highviberetreats.com/u/</span>
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
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="about">
                        <AccordionTrigger className="text-2xl font-headline">About</AccordionTrigger>
                         <AccordionContent className="pt-6 space-y-8">
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
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="gallery">
                        <AccordionTrigger className="text-2xl font-headline">Gallery</AccordionTrigger>
                         <AccordionContent className="pt-6 space-y-8">
                             <FormField
                                control={form.control}
                                name="galleryUrls"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Personal Gallery (up to 6 images)</FormLabel>
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
                        </AccordionContent>
                    </AccordionItem>

                    {isVendor && (
                        <AccordionItem value="vendor-profile">
                            <AccordionTrigger className="text-2xl font-headline">Vendor Profile</AccordionTrigger>
                            <AccordionContent className="pt-6 space-y-8">
                                <FormField
                                    control={form.control}
                                    name="vendorCategories"
                                    render={() => (
                                        <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">Vendor Categories</FormLabel>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        </div>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="offerings"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Specific Offerings (up to 10)</FormLabel>
                                                <FormControl><Textarea {...field} placeholder="e.g. Vinyasa Yoga, Sound Baths, Vegan Catering" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="vendorWebsite"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl><Input {...field} placeholder="https://yourwebsite.com" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="instagramUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Instagram</FormLabel>
                                                <FormControl><Input {...field} placeholder="https://instagram.com/yourhandle" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="serviceRadiusMiles"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Service Radius: {field.value || 0} miles</FormLabel>
                                                <FormControl>
                                                    <Slider
                                                        value={[field.value || 0]}
                                                        onValueChange={(value) => field.onChange(value[0])}
                                                        max={1000}
                                                        step={25}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="portfolioUrls"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Portfolio (up to 8 images)</FormLabel>
                                                <FormControl>
                                                    <ImageUpload
                                                        value={field.value || []}
                                                        onChange={field.onChange}
                                                        storagePath={`users/${userId}/portfolio/`}
                                                        multiple
                                                        maxFiles={8}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {isHost && (
                         <AccordionItem value="host-profile">
                            <AccordionTrigger className="text-2xl font-headline">Host Profile</AccordionTrigger>
                            <AccordionContent className="pt-6 space-y-8">
                                <FormField
                                    control={form.control}
                                    name="typicalCapacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Typical Guest Capacity</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hostVibe"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hosting Vibe</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a vibe..." /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {hostVibes.map(vibe => (
                                                        <SelectItem key={vibe.name} value={vibe.name}>{vibe.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hostAmenities"
                                    render={() => (
                                    <FormItem>
                                        <div className="mb-4"><FormLabel className="text-base">Amenities</FormLabel></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {hostAmenities.map((item) => (
                                            <FormField
                                            key={item}
                                            control={form.control}
                                            name="hostAmenities"
                                            render={({ field }) => (
                                                <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(item)}
                                                            onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), item])
                                                                : field.onChange(field.value?.filter((value) => value !== item))
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{item}</FormLabel>
                                                </FormItem>
                                            )}
                                            />
                                        ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="propertyShowcaseUrls"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Showcase (up to 10 images)</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value || []}
                                                    onChange={field.onChange}
                                                    storagePath={`users/${userId}/properties/`}
                                                    multiple
                                                    maxFiles={10}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>

                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>
            </form>
        </Form>
    );
}
