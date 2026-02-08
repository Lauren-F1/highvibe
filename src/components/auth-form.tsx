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
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

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

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
  role?: 'guide' | 'host' | 'vendor';
};

export function AuthForm({ mode, role }: AuthFormProps) {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const redirectPath = role ? `/${role}/onboarding` : '/guide';

  const createUserProfileDocument = async (user: import('firebase/auth').User, selectedRole: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userData = {
      uid: user.uid,
      email: user.email?.toLowerCase(),
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      roles: {
        guide: selectedRole === 'guide',
        host: selectedRole === 'host',
        vendor: selectedRole === 'vendor',
      },
      primaryRole: selectedRole,
      profileStatus: 'incomplete',
      createdAt: serverTimestamp(),
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
        if (!role) throw new Error('Role is required for signup.');
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await createUserProfileDocument(userCredential.user, role);
        toast({ title: 'Account created!', description: "Let's build your profile." });
        router.push(redirectPath);
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        router.push('/guide'); // Redirect to a default dashboard after login
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!app || !firestore) return;
    setLoading(true);
    setError(null);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
      
      // If it's a new user signing up via a join page, create their profile
      if (isNewUser && mode === 'signup' && role) {
        await createUserProfileDocument(result.user, role);
        toast({ title: 'Account created!', description: "Let's build your profile." });
        router.push(redirectPath);
      } else {
        // For returning users or login page sign-ins, just redirect
        router.push('/guide');
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
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
            </Button>
            </form>
        </Form>
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>
        <Button variant="outline" onClick={handleGoogleSignIn} className="w-full" disabled={loading}>
            Sign In with Google
        </Button>

        <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
                <>
                    <p>
                        Don't have an account?{' '}
                        <Link href="/join/guide" className="text-primary hover:underline">
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
