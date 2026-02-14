'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { manifestRetreatTypes, manifestMustHaves, manifestNiceToHaves, lodgingPreferences, luxuryTiers, dietaryPreferences, destinations } from '@/lib/mock-data';
import appConfig from '@/config/app.json';

const countries = Object.keys(destinations).flatMap(continent => destinations[continent as keyof typeof destinations]);

const manifestSchema = z.object({
  guidingPreference: z.enum(['match_guide', 'i_am_guide'], {
    required_error: "Please make a selection to continue."
  }),
  destination_country: z.string().min(1, "Country is required"),
  destination_region: z.string().optional(),
  date_type: z.enum(['flexible', 'exact']),
  date_month: z.string().optional(),
  date_season: z.string().optional(),
  date_range: z.object({ from: z.date().optional(), to: z.date().optional() }).optional(),
  group_size: z.coerce.number().min(1, "Group size must be at least 1"),
  retreat_types: z.array(z.string()).optional(),
  must_haves: z.array(z.string()).optional(),
  nice_to_haves: z.array(z.string()).optional(),
  lodging_preference: z.string().optional(),
  luxury_tier: z.string().min(1, "Luxury tier is required"),
  budget_range: z.string().optional(),
  dietary_preference: z.array(z.string()).optional(),
  notes_text: z.string().min(20, "Please provide some details about your dream retreat."),
});

type ManifestFormValues = z.infer<typeof manifestSchema>;

const steps = [
  { id: 1, title: "Who's guiding?", fields: ['guidingPreference'] },
  { id: 2, title: 'Destination & Timing', fields: ['destination_country', 'group_size', 'date_type', 'date_range', 'date_month', 'date_season'] },
  { id: 3, title: 'Retreat Vision', fields: ['retreat_types', 'must_haves', 'nice_to_haves', 'lodging_preference'] },
  { id: 4, title: 'Budget & Vibe', fields: ['luxury_tier', 'budget_range', 'dietary_preference', 'notes_text'] },
  { id: 5, title: 'Review & Submit' },
];

export default function NewManifestationPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();

  const form = useForm<ManifestFormValues>({
    resolver: zodResolver(manifestSchema),
    defaultValues: {
      date_type: 'flexible',
      group_size: 10,
    },
  });

  const { control, trigger, getValues, watch } = form;
  const watchedDateType = watch('date_type');

  const handleContinueAsGuide = () => {
    if (user.status === 'authenticated') {
      router.push('/guide/retreats/new?createdFrom=seeker_manifest');
    } else {
      router.push('/join/guide?redirect=/guide/retreats/new?createdFrom=seeker_manifest');
    }
  };

  const handleNext = async () => {
    const fields = steps[step - 1].fields;
    const isValid = await trigger(fields as any, { shouldFocus: true });
    if (isValid) {
      if (step === 1) {
        const guidingChoice = getValues('guidingPreference');
        if (guidingChoice === 'i_am_guide') {
          handleContinueAsGuide();
          return;
        }
      }
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const onSubmit = async (data: ManifestFormValues) => {
    if (user.status !== 'authenticated' || !firestore) {
      toast({ title: "Please log in to manifest a retreat.", variant: "destructive" });
      router.push('/login');
      return;
    }

    const payload = {
      seeker_id: user.data.uid,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      status: 'submitted',
      guidingPreference: "match_guide",
      destination: {
        country: data.destination_country,
        region: data.destination_region,
        city: '', // Not in form
      },
      date_pref: {
        type: data.date_type,
        start_date: data.date_range?.from,
        end_date: data.date_range?.to,
        month: data.date_month,
        season: data.date_season,
      },
      group_size: data.group_size,
      retreat_types: data.retreat_types,
      must_haves: data.must_haves,
      nice_to_haves: data.nice_to_haves,
      lodging_preference: data.lodging_preference,
      luxury_tier: data.luxury_tier,
      budget_range: data.budget_range,
      dietary_preference: data.dietary_preference,
      notes_text: data.notes_text,
      credit_policy: appConfig.manifestCredit,
      matched_summary_counts: { hosts: 0, guides: 0, vendors: 0 },
    };

    try {
      const docRef = await addDoc(collection(firestore, 'manifestations'), payload);
      toast({ title: "Manifestation Submitted!", description: "We're matching you with providers." });
      router.push(`/seeker/manifestations/${docRef.id}`);
    } catch (error) {
      console.error("Error submitting manifestation:", error);
      toast({ title: "Submission failed", description: "Could not save your manifestation. Please try again.", variant: "destructive" });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Guiding control={control} />;
      case 2:
        return <Step2Destination control={control} watchedDateType={watchedDateType} />;
      case 3:
        return <Step3Vision control={control} />;
      case 4:
        return <Step4Budget control={control} />;
      case 5:
        return <Step5Review values={getValues()} />;
      default:
        return null;
    }
  };
  
  const progressValue = step > 1 ? ((step - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Manifest a Retreat</CardTitle>
          <CardDescription>Describe your ideal experience and let us bring it to life.</CardDescription>
          <Progress value={progressValue} className="mt-4" />
          <h3 className="text-center font-bold text-lg pt-4">{steps[step - 1].title}</h3>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="min-h-[400px]">
            {renderStep()}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 && <Button type="button" variant="outline" onClick={handleBack}>Back</Button>}
            <div className="flex-grow"></div>
            {step < 5 && <Button type="button" onClick={handleNext}>Next</Button>}
            {step === 5 && <Button type="submit">Send my Manifestation</Button>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// --- Steps as separate components ---

const Step1Guiding = ({ control }: { control: any }) => (
  <div className="space-y-6">
    <Controller
      name="guidingPreference"
      control={control}
      render={({ field, fieldState }) => (
        <>
          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-4">
            <Label className="flex items-center space-x-3 border p-4 rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary cursor-pointer">
              <RadioGroupItem value="match_guide" id="match_guide" />
              <div className="leading-snug">
                <span className="font-bold">Match me with a Guide</span>
                <p className="font-normal text-muted-foreground text-sm">Find a retreat leader from the HighVibe network to create and lead your experience.</p>
              </div>
            </Label>
            <Label className="flex items-center space-x-3 border p-4 rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary cursor-pointer">
              <RadioGroupItem value="i_am_guide" id="i_am_guide" />
              <div className="leading-snug">
                <span className="font-bold">I'm the Guide</span>
                <p className="font-normal text-muted-foreground text-sm">You are the retreat leader, creating an experience for your own community.</p>
              </div>
            </Label>
          </RadioGroup>
          {fieldState.error && <p className="text-sm text-destructive pt-2">{fieldState.error.message}</p>}
        </>
      )}
    />
  </div>
);

const Step2Destination = ({ control, watchedDateType }: { control: any, watchedDateType: string }) => (
  <div className="space-y-6">
    <Controller name="destination_country" control={control} render={({ field, fieldState }) => (
      <div className="space-y-2">
        <Label>Destination Country</Label>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <SelectTrigger><SelectValue placeholder="Select a country..." /></SelectTrigger>
          <SelectContent>
            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
      </div>
    )} />
    <Controller name="destination_region" control={control} render={({ field }) => (
        <div className="space-y-2">
            <Label>Destination Region/City (optional)</Label>
            <Input {...field} placeholder="e.g., Amalfi Coast" />
        </div>
    )} />
    <Controller name="group_size" control={control} render={({ field, fieldState }) => (
        <div className="space-y-2">
            <Label>Group Size</Label>
            <Input type="number" {...field} />
            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
        </div>
    )} />

    <Controller name="date_type" control={control} render={({ field }) => (
        <div className="space-y-2">
            <Label>Dates</Label>
            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="flexible" id="flexible" /><Label htmlFor="flexible">Flexible</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="exact" id="exact" /><Label htmlFor="exact">Exact Dates</Label></div>
            </RadioGroup>
        </div>
    )} />

    {watchedDateType === 'flexible' ? (
      <div className="grid grid-cols-2 gap-4">
        <Controller name="date_month" control={control} render={({ field }) => (
            <div className="space-y-2">
                <Label>Month (optional)</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="e.g., October" /></SelectTrigger><SelectContent>{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
            </div>
        )} />
        <Controller name="date_season" control={control} render={({ field }) => (
             <div className="space-y-2">
                <Label>Season (optional)</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="e.g., Spring" /></SelectTrigger><SelectContent>{['Spring', 'Summer', 'Fall', 'Winter'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
        )} />
      </div>
    ) : (
      <Controller name="date_range" control={control} render={({ field }) => (
        <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
                <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value?.from && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value?.from ? (field.value.to ? <>{format(field.value.from, "LLL dd, y")} - {format(field.value.to, "LLL dd, y")}</> : format(field.value.from, "LLL dd, y")) : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={field.value?.from} selected={field.value} onSelect={field.onChange} numberOfMonths={2} />
                </PopoverContent>
            </Popover>
        </div>
      )} />
    )}
  </div>
);

const Step3Vision = ({ control }: { control: any }) => {
    const CheckboxGroup = ({ name, label, options }: { name: any, label: string, options: string[] }) => (
        <Controller name={name} control={control} render={({ field }) => (
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="grid grid-cols-2 gap-2">
                    {options.map(item => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`${name}-${item}`} checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                                return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value: string) => value !== item))
                            }} />
                            <Label htmlFor={`${name}-${item}`} className="font-normal">{item}</Label>
                        </div>
                    ))}
                </div>
            </div>
        )} />
    );

    return (
        <div className="space-y-6">
            <CheckboxGroup name="retreat_types" label="Retreat Type" options={manifestRetreatTypes} />
            <CheckboxGroup name="must_haves" label="Must-Haves" options={manifestMustHaves} />
            <CheckboxGroup name="nice_to_haves" label="Nice-to-Haves" options={manifestNiceToHaves} />
            <Controller name="lodging_preference" control={control} render={({ field }) => (
                <div className="space-y-2">
                    <Label>Lodging Preference (optional)</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select lodging type..." /></SelectTrigger><SelectContent>{lodgingPreferences.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
                </div>
            )} />
        </div>
    );
};

const Step4Budget = ({ control }: { control: any }) => (
  <div className="space-y-6">
    <Controller name="luxury_tier" control={control} render={({ field, fieldState }) => (
        <div className="space-y-2">
            <Label>Luxury Tier</Label>
            <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select luxury tier..." /></SelectTrigger><SelectContent>{luxuryTiers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
        </div>
    )} />
    <Controller name="budget_range" control={control} render={({ field }) => (
        <div className="space-y-2">
            <Label>Budget Range (optional)</Label>
            <Input {...field} placeholder="e.g., $5,000 - $8,000 per person" />
        </div>
    )} />
     <Controller name="dietary_preference" control={control} render={({ field }) => (
        <div className="space-y-2">
            <Label>Dietary Preference (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
                {dietaryPreferences.map(item => (
                    <div key={item} className="flex items-center space-x-2">
                        <Checkbox id={`diet-${item}`} checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                            return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value: string) => value !== item))
                        }} />
                        <Label htmlFor={`diet-${item}`} className="font-normal">{item}</Label>
                    </div>
                ))}
            </div>
        </div>
    )} />
    <Controller name="notes_text" control={control} render={({ field, fieldState }) => (
        <div className="space-y-2">
            <Label>Describe your dream retreat</Label>
            <Textarea {...field} rows={6} placeholder="Tell us more about the vision, feeling, and details of your ideal experience." />
            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
        </div>
    )} />
  </div>
);

const Step5Review = ({ values }: { values: ManifestFormValues }) => (
  <div className="space-y-4 text-sm">
      <h4 className="font-bold text-lg mb-2">Review Your Manifestation</h4>
      <div className="space-y-1"><span className="font-semibold">Destination:</span> {values.destination_country}{values.destination_region && `, ${values.destination_region}`}</div>
      <div className="space-y-1"><span className="font-semibold">Group Size:</span> {values.group_size} people</div>
      <div className="space-y-1"><span className="font-semibold">Dates:</span> {values.date_type === 'exact' ? `${values.date_range?.from ? format(values.date_range.from, 'PP') : ''} to ${values.date_range?.to ? format(values.date_range.to, 'PP') : ''}` : `Flexible (${values.date_month || ''} ${values.date_season || ''})`}</div>
      <div className="space-y-1"><span className="font-semibold">Retreat Types:</span> {values.retreat_types?.join(', ') || 'Any'}</div>
      <div className="space-y-1"><span className="font-semibold">Must-Haves:</span> {values.must_haves?.join(', ') || 'None'}</div>
      <div className="space-y-1"><span className="font-semibold">Nice-to-Haves:</span> {values.nice_to_haves?.join(', ') || 'None'}</div>
      <div className="space-y-1"><span className="font-semibold">Lodging:</span> {values.lodging_preference || 'Any'}</div>
      <div className="space-y-1"><span className="font-semibold">Luxury Tier:</span> {values.luxury_tier}</div>
      <div className="space-y-1"><span className="font-semibold">Budget:</span> {values.budget_range || 'Not specified'}</div>
      <div className="space-y-1"><span className="font-semibold">Dietary Needs:</span> {values.dietary_preference?.join(', ') || 'None'}</div>
      <div className="space-y-1"><span className="font-semibold">Notes:</span> <p className="text-muted-foreground whitespace-pre-wrap">{values.notes_text}</p></div>
  </div>
);
