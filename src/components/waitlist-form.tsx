'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import * as analytics from '@/lib/analytics';

const waitlistSchema = z.object({
  firstName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  roleInterest: z.string({ required_error: 'Please select a role.' }),
});

type WaitlistFormInputs = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
    source: string;
    defaultRole?: string;
}

export function WaitlistForm({ source, defaultRole }: WaitlistFormProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<WaitlistFormInputs>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      roleInterest: defaultRole,
    }
  });

  const onSubmit = async (data: WaitlistFormInputs) => {
    analytics.event('waitlist_submit', { category: 'engagement', label: source });
    setFormState('submitting');
    setErrorMessage(null);

    const { firstName, email, roleInterest } = data;
    
    const payload: Record<string, any> = {
        email: email.trim(),
        source: source || 'unknown',
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_term: searchParams.get('utm_term'),
        utm_content: searchParams.get('utm_content'),
    };

    if (firstName) payload.firstName = firstName.trim();
    if (roleInterest) payload.roleInterest = roleInterest;

    Object.keys(payload).forEach(key => (payload[key] === null || payload[key] === undefined) && delete payload[key]);
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        const errorMsg = result.error || 'An unknown server error occurred.';
        setErrorMessage(errorMsg);
        setFormState('error');
        return;
      }
      
      analytics.event('waitlist_success', { category: 'engagement', label: source });
      setFormState('submitted');

      if (result.message) {
        toast({
            title: "We saved your spot!",
            description: "Email confirmation is temporarily unavailable.",
        });
      } else {
        toast({
            title: "You're on the list!",
            description: "We'll email you when HighVibe opens.",
        });
      }
      
      reset();
    } catch (error: any) {
      console.error('Waitlist form submission error:', error);
      setErrorMessage('Could not connect to the server. Please check your internet connection.');
      setFormState('error');
    }
  };
  
  if (formState === 'submitted') {
    return (
      <div className="text-center p-8 bg-secondary rounded-lg">
        <h3 className="font-bold text-xl">You’re on the list.</h3>
        <p className="text-muted-foreground mt-2">We’ll email you when HighVibe opens.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       {formState === 'error' && (
          <p className="text-destructive text-sm text-center">{errorMessage} Please try again.</p>
        )}
      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="First Name" {...register('firstName')} />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} autoComplete="email" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="roleInterest">I’m interested in joining as a…</Label>
        <Controller
          name="roleInterest"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="roleInterest">
                    <SelectValue placeholder="Select a role…" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Seeker (I want to find/book retreats)">Seeker (I want to find/book retreats)</SelectItem>
                    <SelectItem value="Guide (I want to lead retreats)">Guide (I want to lead retreats)</SelectItem>
                    <SelectItem value="Host (I have a space)">Host (I have a space)</SelectItem>
                    <SelectItem value="Vendor (I offer services)">Vendor (I offer services)</SelectItem>
                    <SelectItem value="Partner / Collaborator">Partner / Collaborator</SelectItem>
                </SelectContent>
            </Select>
          )}
        />
        {errors.roleInterest && <p className="text-sm text-destructive">{errors.roleInterest.message}</p>}
      </div>
      <Button type="submit" disabled={formState === 'submitting'} className="w-full">
        {formState === 'submitting' ? 'Submitting...' : 'Join the Waitlist'}
      </Button>
      <p className="text-xs text-muted-foreground text-center !mt-2">
        Verified = confirmed email. Limited to the intro launch window; not offered again.
      </p>
    </form>
  );
}
