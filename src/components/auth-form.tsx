'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirebaseApp, useFirestore } from '@/firebase';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';

const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string().optional(),
  terms: z.boolean().optional(),
}).refine(data => {
    if (data.confirmPassword) {
        return data.password === data.confirmPassword
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).refine(data => {
    if (data.terms !== undefined) {
        return data.terms === true;
    }
    return true;
}, {
    message: 'You must accept the terms and conditions.',
    path: ['terms'],
});

type AuthFormProps = {
  mode: 'login' | 'signup';
  role?: 'guide' | 'host' | 'vendor' | 'seeker';
};

export function AuthForm({ mode, role }: AuthFormProps) {
  const router = useRouter();
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const redirectPath = role ? `/${role}` : '/guide';

  const createUserProfileDocument = async (user: import('firebase/auth').User, data: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    
    const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ') || user.displayName || '';
    
    const userData = {
      uid: user.uid,
      email: user.email?.toLowerCase(),
      displayName,
      photoURL: user.photoURL || '',
      roles: role ? [role] : [],
      primaryRole: role || null,
      onboardingComplete: !!role,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(userRef, userData, { merge: true });
  };

  const handleEmailSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!app || !firestore) return;
    setLoading(true);
    setError(null);
    const auth = getAuth(app);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await createUserProfileDocument(userCredential.user, values);
        toast({ title: 'Account created!', description: "Let's get started." });
        if (role) {
            router.push(redirectPath);
        } else {
            router.push('/onboarding/role');
        }
      } else { // login
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const userDocRef = doc(firestore, 'users', userCredential.user.uid);
        await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        
        // This part is handled by the login page useEffect now
        // router.push(redirectPath); 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    const email = form.getValues('email');
    if (!email) {
        toast({ variant: 'destructive', title: 'Please enter your email address to reset your password.' });
        return;
    }
    if (!app) return;
    const auth = getAuth(app);
    sendPasswordResetEmail(auth, email)
        .then(() => {
            toast({ title: 'Password Reset Email Sent', description: 'Check your inbox for a link to reset your password.' });
        })
        .catch((error) => {
            setError(error.message);
        });
  };

  return (
    <div className="space-y-4">
        {error && <p className="text-destructive text-center text-sm">{error}</p>}
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="space-y-4">
            {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                            <Input placeholder="First" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Last" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            )}
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            {mode === 'signup' && (
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
            {mode === 'signup' && (
                 <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                                I agree to the <Link href="/terms" className="underline hover:text-primary" target="_blank">Terms of Service</Link>.
                            </FormLabel>
                            <FormMessage />
                        </div>
                    </FormItem>
                    )}
                />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
            </Button>
            </form>
        </Form>
       
        <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
                <>
                    <p>
                        Don't have an account?{' '}
                        <Link href="/join" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                    <Button variant="link" size="sm" onClick={handlePasswordReset} className="p-0 h-auto mt-2">
                        Forgot password?
                    </Button>
                </>
            ) : (
                <p>
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            )}
        </div>
    </div>
  );
}
