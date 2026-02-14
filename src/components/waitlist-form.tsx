'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const waitlistSchema = z.object({
  firstName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  roleInterest: z.string().optional(),
});

type WaitlistFormInputs = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
    source: string;
}

export function WaitlistForm({ source }: WaitlistFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<WaitlistFormInputs>({
    resolver: zodResolver(waitlistSchema),
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

      await setDoc(waitlistRef, {
        email: email,
        firstName: data.firstName || null,
        roleInterest: data.roleInterest || null,
        source: source,
        createdAt: serverTimestamp(),
        status: 'new',
        userAgent: navigator.userAgent,
      });

      setFormState('submitted');
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
        <Label htmlFor="roleInterest">I'm interested in being a...</Label>
        <Controller
          name="roleInterest"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="roleInterest">
                    <SelectValue placeholder="Select a role... (optional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Seeker">Seeker</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Host">Host</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Not sure">Not sure</SelectItem>
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
