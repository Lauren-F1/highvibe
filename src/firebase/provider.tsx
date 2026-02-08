'use client';

import { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseEnabled } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function initializeFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
} {
  if (!isFirebaseEnabled) {
    return { app: null, auth: null, firestore: null };
  }
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
export interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export function FirebaseProvider({
  children,
  ...value
}: { children: ReactNode } & FirebaseContextType) {
  return (
    <FirebaseContext.Provider value={value}>
      {isFirebaseEnabled && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase()?.app ?? null;
}

export function useAuth() {
  return useFirebase()?.auth ?? null;
}

export function useFirestore() {
  return useFirebase()?.firestore ?? null;
}
