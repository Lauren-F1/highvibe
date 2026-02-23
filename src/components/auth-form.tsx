
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Checkbox } from './ui/checkbox';
import { isFirebaseEnabled } from '@/firebase/config';

const createSignupSchema = (role?: 'guide' | 'host' | 'vendor' | 'seeker') => {
  const isProvider = role && ['guide', 'host', 'vendor'].includes(role);
  const isHost = role === 'host';

  const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions.' })
    }),
    providerAgreement: isProvider
      ? z.literal(true, {
          errorMap: () => ({ message: 'You must accept the provider agreement.' })
        })
      : z.boolean().optional(),
    hostRider: isHost
      ? z.literal(true, {
          errorMap: () => ({ message: 'You must accept the Host Property Risk Rider.' })
        })
      : z.boolean().optional(),
  }).refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
  });

  return schema;
}

const formSchemaLogin = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});


type AuthFormProps = {
  mode: 'login' | 'signup';
  role?: 'guide' | 'host' | 'vendor' | 'seeker';
};

export function AuthForm({ mode, role }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupSchema = createSignupSchema(role);
  type SignupFormValues = z.infer<typeof signupSchema>;

  const form = useForm({
    resolver: zodResolver(mode === 'signup' ? signupSchema : formSchemaLogin),
    defaultValues: mode === 'signup' 
        ? { email: '', password: '', firstName: '', lastName: '', confirmPassword: '', terms: false, providerAgreement: false, hostRider: false }
        : { email: '', password: '' },
  });
  
  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please log in.';
      case 'auth/weak-password':
        return 'Your password must be at least 8 characters long.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };


  const createUserProfileDocument = async (user: import('firebase/auth').User, data: SignupFormValues) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    
    const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ');
    const profileSlug = displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const userData: any = {
      uid: user.uid,
      email: user.email?.toLowerCase(),
      displayName,
      profileSlug: `${profileSlug}-${user.uid.substring(0, 4)}`, // basic uniqueness
      avatarUrl: user.photoURL || '',
      roles: role ? [role] : [],
      primaryRole: role || null,
      profileComplete: false,
      onboardingComplete: !!role, // if role is passed, consider it complete for now
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    const isProvider = role && ['guide', 'host', 'vendor'].includes(role);
    if (isProvider && data.providerAgreement) {
        userData.providerAgreementAccepted = true;
        userData.providerAgreementAcceptedAt = serverTimestamp();
        userData.providerAgreementVersion = "v1.0-02-01-2026";
    }

    const isHost = role === 'host';
    if (isHost && data.hostRider) {
        userData.hostRiderAccepted = true;
        userData.hostRiderAcceptedAt = serverTimestamp();
        userData.hostRiderVersion = "v1.0-02-01-2026";
    }

    await setDoc(userRef, userData);
  };

  const handleEmailSubmit = async (values: any) => {
    setLoading(true);
    setError(null);

    const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true';

    // In Launch Mode, only allow admin emails to log in.
    if (isLaunchMode && mode === 'login') {
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
      
      const userEmail = values.email.toLowerCase();

      if (!adminEmails.includes(userEmail)) {
        setError('Prelaunch access is limited. Join the waitlist to be notified.');
        document.cookie = 'isAdminBypass=; path=/; max-age=0'; // Explicitly clear cookie
        setLoading(false);
        return;
      }
    }


    if (!isFirebaseEnabled) {
      // DEV AUTH MODE
      const displayName = mode === 'signup' 
        ? [values.firstName, values.lastName].filter(Boolean).join(' ') 
        : 'Dev User';

      const devUser = {
        uid: 'dev-user-01',
        email: values.email,
        displayName: displayName,
      };

      const devProfile: any = {
        uid: 'dev-user-01',
        email: values.email,
        displayName: displayName,
        roles: role ? [role] : ['guide'],
        primaryRole: role || 'guide',
        onboardingComplete: true,
        profileComplete: true,
      };
      
      const isProvider = role && ['guide', 'host', 'vendor'].includes(role);
      if (isProvider) {
          devProfile.providerAgreementAccepted = true;
      }

      const isHost = role === 'host';
      if (isHost) {
          devProfile.hostRiderAccepted = true;
      }


      localStorage.setItem('devUser', JSON.stringify(devUser));
      localStorage.setItem('devProfile', JSON.stringify(devProfile));

      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      if (values.email && adminEmails.includes(values.email.toLowerCase())) {
        document.cookie = 'isAdminBypass=true; path=/; max-age=86400'; // 1 day
      }

      toast({
        title: mode === 'signup' ? 'Dev Account Created' : 'Logged in (Dev Mode)',
        description: `Welcome, ${displayName}!`,
      });
      
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect);
      } else {
        router.push(devProfile.primaryRole ? `/${devProfile.primaryRole}` : '/');
      }

      setLoading(false);
      return;
    }

    // PRODUCTION FIREBASE MODE
    const auth = getAuth(app!);
    const firestoreDb = useFirestore();

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await createUserProfileDocument(userCredential.user, values);
        toast({ title: 'Account created!', description: "Let's get started." });
      } else { // login
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || '')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        if (userCredential.user.email && adminEmails.includes(userCredential.user.email.toLowerCase())) {
            document.cookie = 'isAdminBypass=true; path=/; max-age=86400'; // 1 day
        }
        
        if (firestoreDb) {
            const userDocRef = doc(firestoreDb, 'users', userCredential.user.uid);
            await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        }
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    if (!isFirebaseEnabled) {
      toast({
          variant: "default",
          title: "Dev Mode",
          description: "Password reset is not applicable in dev mode.",
      });
      return;
    }
    const email = form.getValues('email');
    if (!email) {
        toast({ variant: 'destructive', title: 'Please enter your email address to reset your password.' });
        return;
    }
    
    const auth = getAuth(app!);
    sendPasswordResetEmail(auth, email)
        .then(() => {
            toast({ title: 'Password Reset Email Sent', description: 'Check your inbox for a link to reset your password.' });
        })
        .catch((error) => {
            setError(getFriendlyErrorMessage(error.code));
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
                            <FormLabel>Last Name (optional)</FormLabel>
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
            
            {mode === 'signup' && ['guide', 'host', 'vendor'].includes(role || '') && (
                 <FormField
                    control={form.control}
                    name="providerAgreement"
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
                                I agree to the <Link href="/provider-agreement" className="underline hover:text-primary" target="_blank">Provider Agreement</Link>.
                            </FormLabel>
                            <FormMessage />
                        </div>
                    </FormItem>
                    )}
                />
            )}

            {mode === 'signup' && role === 'host' && (
                 <FormField
                    control={form.control}
                    name="hostRider"
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
                                I agree to the <Link href="/host-property-rider" className="underline hover:text-primary" target="_blank">Host Property Risk Rider</Link>.
                            </FormLabel>
                            <FormMessage />
                        </div>
                    </FormItem>
                    )}
                />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Create Account')}
            </Button>
            </form>
        </Form>
       
        <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
                <>
                    <p>
                        New here?{' '}
                        <Link href="/join" className="text-primary hover:underline">
                           Create an account
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
