'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const waitlistSchema = z.object({
  firstName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  roleInterest: z.string().optional(),
});

type WaitlistFormInputs = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
    source: string;
    defaultRole?: string;
}

export function WaitlistForm({ source, defaultRole }: WaitlistFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<WaitlistFormInputs>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      roleInterest: defaultRole,
    }
  });

  const onSubmit = async (data: WaitlistFormInputs) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to the database.',
      });
      setFormState('error');
      return;
    }
    setFormState('submitting');
    
    try {
      const email = data.email.toLowerCase().trim();
      const waitlistRef = doc(firestore, 'waitlist', email);

      await runTransaction(firestore, async (transaction) => {
        const waitlistDoc = await transaction.get(waitlistRef);
        if (waitlistDoc.exists()) {
            transaction.update(waitlistRef, {
                updatedAt: serverTimestamp(),
                submitCount: increment(1),
                source: source, // update source on re-submit
            });
        } else {
            transaction.set(waitlistRef, {
                email: email,
                firstName: data.firstName || null,
                roleInterest: data.roleInterest || null,
                source: source,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'new',
                submitCount: 1,
                userAgent: navigator.userAgent,
            });
        }
      });

      setFormState('submitted');
      toast({
        title: "You're on the list!",
        description: "We'll email you when HighVibe opens.",
      });
      reset();
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'Something went wrong. Please try again.',
      });
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
          <p className="text-destructive text-sm text-center">Something went wrong. Please try again.</p>
        )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="First Name" {...register('firstName')} />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="roleInterest">I’m interested in joining as a… (optional)</Label>
        <Controller
          name="roleInterest"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="roleInterest">
                    <SelectValue placeholder="Select a role… (optional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Seeker (I want to find/book retreats)">Seeker (I want to find/book retreats)</SelectItem>
                    <SelectItem value="Guide (I want to host retreats)">Guide (I want to host retreats)</SelectItem>
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
