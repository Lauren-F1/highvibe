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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/image-upload';
import { vendorCategories, hostAmenities, hostVibes } from '@/lib/mock-data';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';
import { improveProfileText } from '@/ai/flows/improve-profile-text-flow';
import { Loader2, Sparkles } from 'lucide-react';

const profileSchema = z.object({
    displayName: z.string().min(2, 'Display name is required'),
    profileSlug: z.string(), // Read-only, so no validation needed here.
    headline: z.string().max(80).optional(),
    bio: z.string().max(600).optional(),
    locationLabel: z.string().optional(),
    isWillingToTravel: z.boolean().default(false),
    travelRadiusMiles: z.number().min(0).max(500).optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    galleryUrls: z.array(z.string().url()).max(6).optional(),
    
    // Role management
    roles: z.array(z.string()).min(1, 'Please select at least one role.'),
    primaryRole: z.string().min(1, 'Please select a primary role.'),

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

    // Manifestation Settings
    accepts_manifestations: z.boolean().default(true),
    manifestation_notification_frequency: z.string().optional(),
    max_manifestations_per_week: z.coerce.number().min(0).optional(),
    countries_served: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type Role = 'seeker' | 'guide' | 'host' | 'vendor';

interface ProfileFormProps {
    userProfile: UserProfile;
    userId: string;
}

export function ProfileForm({ userProfile, userId }: ProfileFormProps) {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isImprovingBio, setIsImprovingBio] = useState(false);
    const [isImprovingHeadline, setIsImprovingHeadline] = useState(false);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: userProfile.displayName || '',
            profileSlug: userProfile.profileSlug || '',
            headline: userProfile.headline || '',
            bio: userProfile.bio || '',
            locationLabel: userProfile.locationLabel || '',
            isWillingToTravel: userProfile.isWillingToTravel || false,
            travelRadiusMiles: userProfile.travelRadiusMiles ?? undefined,
            avatarUrl: userProfile.avatarUrl || '',
            galleryUrls: userProfile.galleryUrls || [],
            roles: userProfile.roles || [],
            primaryRole: userProfile.primaryRole || userProfile.roles?.[0] || '',
            vendorCategories: userProfile.vendorCategories || [],
            vendorWebsite: userProfile.vendorWebsite || '',
            instagramUrl: userProfile.instagramUrl || '',
            offerings: userProfile.offerings?.join(', ') || '',
            portfolioUrls: userProfile.portfolioUrls || [],
            serviceRadiusMiles: userProfile.serviceRadiusMiles ?? undefined,
            hostAmenities: userProfile.hostAmenities || [],
            hostVibe: userProfile.hostVibe || '',
            propertyShowcaseUrls: userProfile.propertyShowcaseUrls || [],
            typicalCapacity: userProfile.typicalCapacity ?? undefined,
            accepts_manifestations: userProfile.accepts_manifestations ?? true,
            manifestation_notification_frequency: userProfile.manifestation_notification_frequency || 'immediate',
            max_manifestations_per_week: userProfile.max_manifestations_per_week ?? undefined,
            countries_served: userProfile.countries_served?.join(', ') || '',
        },
    });
    
    const { formState: { isDirty, isSubmitting } } = form;
    const watchedRoles = form.watch('roles');
    const hasProviderRole = watchedRoles?.some(r => ['guide', 'host', 'vendor'].includes(r));

    const handleImproveText = async (fieldType: 'bio' | 'headline') => {
        const fieldStateSetter = fieldType === 'bio' ? setIsImprovingBio : setIsImprovingHeadline;
        fieldStateSetter(true);

        const originalText = form.getValues(fieldType);
        if (!originalText) {
            toast({ title: "Nothing to improve", description: `Please enter a ${fieldType} first.`, variant: "destructive"});
            fieldStateSetter(false);
            return;
        }

        try {
            const result = await improveProfileText({ text: originalText, textType: fieldType });
            if (result.improvedText) {
                form.setValue(fieldType, result.improvedText, { shouldDirty: true });
                toast({ title: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} improved!`, description: "The AI has rewritten your text."});
            }
        } catch (error) {
            console.error(`Error improving ${fieldType}:`, error);
            toast({ title: `Could not improve ${fieldType}`, description: "The AI assistant encountered an error.", variant: "destructive"});
        } finally {
            fieldStateSetter(false);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        if (!firestore) return;
        
        const offeringsArray = data.offerings ? data.offerings.split(',').map(s => s.trim()).filter(Boolean) : [];
        const countriesArray = data.countries_served ? data.countries_served.split(',').map(s => s.trim()).filter(Boolean) : [];

        const userDocRef = doc(firestore, 'users', userId);
        try {
            await updateDoc(userDocRef, {
                ...data,
                offerings: offeringsArray,
                countries_served: countriesArray,
                profileComplete: true,
                profileSlug: userProfile.profileSlug, // Ensure slug isn't changed
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

    const getRoleLabel = (role: Role) => {
        switch (role) {
            case 'guide': return 'Guide (Retreat Leader)';
            case 'host': return 'Host (Space Owner)';
            case 'vendor': return 'Vendor (Services)';
            case 'seeker': return 'Seeker';
            default: return role;
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 {isDirty && (
                    <div className="fixed top-28 right-8 z-20">
                        <Button type="submit" disabled={isSubmitting} size="lg" className="rounded-lg">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
                
                <Card className="mb-8 border-input">
                    <CardHeader>
                        <CardTitle>Your Roles</CardTitle>
                        <CardDescription className="leading-relaxed">
                            Select the ways you participate on HighVibe. Your Primary Role determines your default dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="roles"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enabled Roles</FormLabel>
                                    <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                                        {(['seeker', 'guide', 'host', 'vendor'] as const).map((role) => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role}`}
                                                    checked={field.value?.includes(role)}
                                                    onCheckedChange={(checked) => {
                                                        const currentRoles = field.value || [];
                                                        const newRoles = checked ? [...currentRoles, role] : currentRoles.filter((r) => r !== role);
                                                        field.onChange(newRoles);

                                                        const primaryRole = form.getValues('primaryRole');
                                                        if (!checked && primaryRole === role) {
                                                            form.setValue('primaryRole', newRoles[0] || '', { shouldDirty: true });
                                                        }
                                                        if (checked && !primaryRole && newRoles.length === 1) {
                                                            form.setValue('primaryRole', newRoles[0], { shouldDirty: true });
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`role-${role}`} className="text-sm font-medium leading-none">
                                                    {getRoleLabel(role)}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="primaryRole"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Role</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedRoles || watchedRoles.length === 0}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a primary role..." /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {watchedRoles?.map((role: string) => (
                                                <SelectItem key={role} value={role}>
                                                    {getRoleLabel(role as Role)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="leading-relaxed">This will be your default experience after logging in.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                
                <Accordion type="multiple" defaultValue={['basics']} className="w-full">
                    <AccordionItem value="basics">
                        <AccordionTrigger className="text-xl font-headline">Basics</AccordionTrigger>
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
                                        <FormDescription>JPG or PNG.</FormDescription>
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
                                        <FormControl><Input {...field} placeholder="e.g., Maya Thompson" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="profileSlug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Public Profile Link</FormLabel>
                                        <div className="flex items-center">
                                            <span className="text-sm text-muted-foreground p-2 bg-muted rounded-l-md border border-r-0 border-input">highviberetreats.com/u/</span>
                                            <FormControl><Input {...field} className="rounded-l-none" readOnly /></FormControl>
                                        </div>
                                        <FormDescription className="leading-relaxed">This is your public link. Copy and share anytime.</FormDescription>
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
                                        <div className="relative">
                                            <FormControl><Input {...field} placeholder="e.g., Yoga Instructor + Sound Healer" /></FormControl>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                                onClick={() => handleImproveText('headline')}
                                                disabled={isImprovingHeadline}
                                                title="Improve with AI"
                                            >
                                                {isImprovingHeadline ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                <span className="sr-only">Improve with AI</span>
                                            </Button>
                                        </div>
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
                                        <FormControl><Input {...field} placeholder="City, Country (e.g., Bali, Indonesia)" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="isWillingToTravel"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Available to Travel</FormLabel>
                                            <FormDescription className="leading-relaxed">Turn on if you’re open to traveling for retreats.</FormDescription>
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
                                            <FormLabel>Travel Radius</FormLabel>
                                            <div className='flex items-center gap-4'>
                                                <FormControl>
                                                    <Slider
                                                        value={[field.value || 0]}
                                                        onValueChange={(value) => field.onChange(value[0])}
                                                        max={500}
                                                        step={25}
                                                    />
                                                </FormControl>
                                                <span className="w-24 text-center p-2 rounded-md bg-muted text-sm">{field.value || 0} miles</span>
                                            </div>
                                            <FormDescription className="leading-relaxed">How far you’re willing to travel for a retreat.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="about">
                        <AccordionTrigger className="text-xl font-headline">About</AccordionTrigger>
                         <AccordionContent className="pt-6 space-y-8">
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <div className="relative">
                                            <FormControl><Textarea {...field} rows={5} placeholder="Share what you offer, your style, and what makes your retreats/services unique." /></FormControl>
                                             <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute right-1 top-2 h-8 w-8"
                                                onClick={() => handleImproveText('bio')}
                                                disabled={isImprovingBio}
                                                title="Improve with AI"
                                            >
                                                {isImprovingBio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                <span className="sr-only">Improve with AI</span>
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="gallery">
                        <AccordionTrigger className="text-xl font-headline">Gallery</AccordionTrigger>
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
                                        <FormDescription>JPG or PNG.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    {watchedRoles?.includes('vendor') && (
                        <AccordionItem value="vendor-profile">
                            <AccordionTrigger className="text-2xl font-headline text-beige-dark">Vendor Profile</AccordionTrigger>
                            <AccordionContent className="pt-6 space-y-8">
                                <p className='text-sm text-muted-foreground -mt-4 leading-relaxed'>Help guides and hosts understand exactly what you provide.</p>
                                <FormField
                                    control={form.control}
                                    name="vendorCategories"
                                    render={() => (
                                        <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">Vendor Categories</FormLabel>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                                                        <FormLabel className="font-normal leading-relaxed">
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
                                                <FormDescription className="leading-relaxed">Use short phrases separated by commas.</FormDescription>
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
                                                <FormLabel>Service Radius</FormLabel>
                                                <div className='flex items-center gap-4'>
                                                    <FormControl>
                                                        <Slider
                                                            value={[field.value || 0]}
                                                            onValueChange={(value) => field.onChange(value[0])}
                                                            max={1000}
                                                            step={25}
                                                        />
                                                    </FormControl>
                                                    <span className="w-24 text-center p-2 rounded-md bg-muted text-sm">{field.value || 0} miles</span>
                                                </div>
                                                <FormDescription className="leading-relaxed">How far you’re willing to travel locally (optional).</FormDescription>
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
                                                <FormDescription>JPG or PNG.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {watchedRoles?.includes('host') && (
                         <AccordionItem value="host-profile">
                            <AccordionTrigger className="text-2xl font-headline text-beige-dark">Host Profile</AccordionTrigger>
                            <AccordionContent className="pt-6 space-y-8">
                                <p className='text-sm text-muted-foreground -mt-4 leading-relaxed'>Help guides find the right space for their retreat.</p>
                                <FormField
                                    control={form.control}
                                    name="typicalCapacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Typical Guest Capacity</FormLabel>
                                            <FormControl><Input type="number" {...field} placeholder="e.g., 18" /></FormControl>
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
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                                                    <FormLabel className="font-normal leading-relaxed">{item}</FormLabel>
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
                                            <FormDescription>JPG or PNG.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {hasProviderRole && (
                         <AccordionItem value="manifestation-settings">
                            <AccordionTrigger className="text-xl font-headline">Manifestation Settings</AccordionTrigger>
                            <AccordionContent className="pt-6 space-y-8">
                                <FormField
                                    control={form.control}
                                    name="accepts_manifestations"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>Accept Manifestation Matches</FormLabel>
                                                <FormDescription className="leading-relaxed">Allow your profile to be matched with seeker requests.</FormDescription>
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
                                <FormField
                                    control={form.control}
                                    name="manifestation_notification_frequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notification Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select frequency..." /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="immediate">Immediate</SelectItem>
                                                    <SelectItem value="daily_digest">Daily Digest</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="max_manifestations_per_week"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Matches Per Week (optional)</FormLabel>
                                            <FormControl><Input type="number" {...field} placeholder="e.g., 5" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="countries_served"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Countries Served (for travelers)</FormLabel>
                                            <FormControl><Textarea {...field} placeholder="e.g. Italy, Greece, Spain" /></FormControl>
                                            <FormDescription className="leading-relaxed">If you travel, list the countries you serve, separated by commas.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>

                <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-lg">
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>
            </form>
        </Form>
    );
}
