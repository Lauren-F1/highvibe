'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePathname } from 'next/navigation';

const contactSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Seeker', 'Guide', 'Host', 'Vendor', 'Other'], {
    required_error: "Please select a role."
  }),
  message: z.string().min(1, 'Message is required'),
});

type ContactFormInputs = z.infer<typeof contactSchema>;

export function ContactForm() {
  const firestore = useFirestore();
  const user = useUser();
  const pathname = usePathname();

  const [formState, setFormState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    if (!firestore) {
      setFormState('error');
      return;
    }
    setFormState('submitting');
    
    try {
      await addDoc(collection(firestore, 'contact_submissions'), {
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        message: data.message,
        createdAt: serverTimestamp(),
        userId: user.status === 'authenticated' ? user.data.uid : null,
        pageContext: pathname,
      });
      setFormState('submitted');
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFormState('error');
    }
  };
  
  if (formState === 'submitted') {
    return (
      <Card className="bg-secondary border-primary/50">
        <CardHeader>
          <CardTitle>Message received.</CardTitle>
          <CardDescription>
            Thanks for reaching out. We’ve saved your message and will respond as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">If you don’t hear back within 2 business days, contact us at: support@highviberetreats.com.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       {formState === 'error' && (
          <p className="text-destructive text-sm text-center">Something didn’t go through — please try again.</p>
        )}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">I'm a...</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Seeker">Seeker</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Host">Host</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
          )}
        />
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" {...register('message')} rows={5} />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={formState === 'submitting'}>
        {formState === 'submitting' ? 'Sending...' : 'Send Message'}
      </Button>
       <p className="text-xs text-muted-foreground pt-4">If you don’t hear back within 2 business days, contact us at: support@highviberetreats.com.</p>
    </form>
  );
}
