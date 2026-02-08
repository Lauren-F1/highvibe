'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  initializeFirebase,
  FirebaseProvider,
  FirebaseContextType,
} from './provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebaseContext, setFirebaseContext] =
    useState<FirebaseContextType | null>(null);

  useEffect(() => {
    const context = initializeFirebase();
    setFirebaseContext(context);
  }, []);

  if (!firebaseContext) {
    // You can return a loader here
    return <div>Loading Firebase...</div>;
  }

  return <FirebaseProvider {...firebaseContext}>{children}</FirebaseProvider>;
}
