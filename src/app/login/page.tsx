'use client';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebaseApp, useFirestore } from '@/firebase';

export default function LoginPage() {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    if (!app || !firestore) return;

    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Save user to Firestore
      await saveUser(user);

      router.push('/guide'); // Redirect to a protected page after login
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  };

  const saveUser = async (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    // Use setDoc with merge: true to create or update user document
    await setDoc(userRef, userData, { merge: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
