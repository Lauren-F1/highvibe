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
import Link from 'next/link';
import * as analytics from '@/lib/analytics';
import {
  SUCCESS_MESSAGE,
  DUPLICATE_MESSAGE,
  NEXT_STEPS,
} from '@/lib/waitlist-constants';

const waitlistSchema = z.object({
  firstName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  roleInterest: z.string({ required_error: 'Please select a role.' }),
});

type WaitlistFormInputs = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
    source: string;
    defaultRole?: string;
    onRoleChange?: (formValue: string) => void;
}

export function WaitlistForm({ source, defaultRole, onRoleChange }: WaitlistFormProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'submitted' | 'duplicate' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<WaitlistFormInputs>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      roleInterest: defaultRole,
    }
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      toast({
        title: 'Link copied!',
        description: 'Share it with a friend to invite them to HighVibe.',
      });
    } catch {
      toast({
        title: 'Could not copy link',
        description: 'You can share this URL: ' + window.location.origin,
      });
    }
  };

  const onSubmit = async (data: WaitlistFormInputs) => {
    analytics.event('waitlist_submit', { category: 'engagement', label: source });
    setFormState('submitting');
    setErrorMessage(null);
    setDebugMessage(null);

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

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        setErrorMessage('Server error (non-JSON response).');
        setDebugMessage(text.substring(0, 200)); 
        setFormState('error');
        return;
      }

      if (!response.ok || !result.ok) {
        const errorMsg = result.message || result.error || 'An unknown server error occurred.';
        setErrorMessage(errorMsg);
        
        const debugParts = [];
        if (result.requestId) debugParts.push(`Request: ${result.requestId}`);
        if (result.stage) debugParts.push(`Stage: ${result.stage}`);
        if (result.debug) debugParts.push(`Debug: ${result.debug}`);
        
        if (debugParts.length > 0) {
            setDebugMessage(debugParts.join(' | '));
        }
        
        setFormState('error');
        return;
      }

      if (result.duplicate) {
        analytics.event('waitlist_duplicate', { category: 'engagement', label: source });
        setFormState('duplicate');
        return;
      }

      analytics.event('waitlist_success', { category: 'engagement', label: source });
      setFormState('submitted');

      if (result.message) {
        toast({
            title: "We saved your spot!",
            description: result.message,
        });
      }

      reset();
    } catch (error: any) {
      console.error('Waitlist form submission error:', error);
      setErrorMessage('Could not connect to the server.');
      setDebugMessage(error.message);
      setFormState('error');
    }
  };

  if (formState === 'duplicate') {
    return (
      <div className="text-center p-8 bg-secondary rounded-lg">
        <h3 className="font-bold text-xl">{DUPLICATE_MESSAGE}</h3>
        <p className="text-muted-foreground mt-2">
          We&apos;ll email you when HighVibe opens.
        </p>
      </div>
    );
  }

  if (formState === 'submitted') {
    return (
      <div className="text-center p-8 bg-secondary rounded-lg space-y-6">
        <h3 className="font-bold text-xl">{SUCCESS_MESSAGE}</h3>

        <div className="text-left mx-auto max-w-sm space-y-3">
          <h4 className="font-semibold text-base">What happens next</h4>
          <ul className="space-y-2">
            {NEXT_STEPS.map((step) => (
              <li key={step} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button asChild>
            <Link href="/how-it-works">Preview how HighVibe works</Link>
          </Button>
          <Button variant="outline" onClick={handleCopyLink}>
            Invite a friend
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       {formState === 'error' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm text-center font-semibold">{errorMessage}</p>
            {debugMessage && (
                <p className="text-destructive/70 text-[10px] text-center mt-2 font-mono break-all">
                    {debugMessage}
                </p>
            )}
            <p className="text-destructive/70 text-xs text-center mt-2">Please try again or contact support.</p>
          </div>
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
        <Label htmlFor="roleInterest">I&apos;m interested in joining as a…</Label>
        <Controller
          name="roleInterest"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onRoleChange?.(value);
              }}
              defaultValue={field.value}
            >
                <SelectTrigger id="roleInterest">
                    <SelectValue placeholder="Select a role…" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Seeker (I want to find/book retreats)">Seeker (I want to find/book retreats)</SelectItem>
                    <SelectItem value="Guide (I want to lead retreats)">Guide (I want to lead retreats)</SelectItem>
                    <SelectItem value="Host (I have a space)">Host (I have a space)</SelectItem>
                    <SelectItem value="Vendor (I offer services)">Vendor (I offer services)</SelectItem>
                </SelectContent>
            </Select>
          )}
        />
        {errors.roleInterest && <p className="text-sm text-destructive">{errors.roleInterest.message}</p>}
      </div>
      <Button type="submit" disabled={formState === 'submitting'} className="w-full">
        {formState === 'submitting' ? 'Submitting...' : 'Join the Waitlist'}
      </Button>
    </form>
  );
}
