'use client';

import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth, useFirebaseApp, useFirestore } from '../provider';
import { FirebaseApp } from 'firebase/app';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';

export type User = FirebaseUser;

// This mirrors the User entity in docs/backend.json
export interface UserProfile extends DocumentData {
  uid: string;
  email: string;
  displayName?: string;
  headline?: string;
  bio?: string;
  profileSlug?: string;
  profileComplete?: boolean;
  avatarUrl?: string;
  galleryUrls?: string[];
  roles: ('guide' | 'host' | 'vendor' | 'seeker')[];
  primaryRole?: 'guide' | 'host' | 'vendor' | 'seeker';
  locationLabel?: string;
  locationLat?: number;
  locationLng?: number;
  isWillingToTravel?: boolean;
  travelRadiusMiles?: number;
  
  // Vendor fields
  vendorCategories?: string[];
  vendorWebsite?: string;
  instagramUrl?: string;
  offerings?: string[];
  portfolioUrls?: string[];
  serviceRadiusMiles?: number;

  // Host fields
  hostVibe?: string;
  hostAmenities?: string[];
  propertyShowcaseUrls?: string[];
  typicalCapacity?: number;

  // Guide fields
  guideRetreatTypes?: string[];

  createdAt?: any;
  lastLoginAt?: any;
}

export type AuthState =
  | {
      status: 'loading';
      data: null;
      profile: undefined; // undefined: profile is loading
      app: FirebaseApp | null;
    }
  | {
      status: 'authenticated';
      data: User;
      profile: UserProfile | null | undefined; // null: profile not found
      app: FirebaseApp | null;
    }
  | {
      status: 'unauthenticated';
      data: null;
      profile: null;
      app: FirebaseApp | null;
    };

export function useUser(): AuthState {
  const app = useFirebaseApp();
  const auth = useAuth();
  const firestore = useFirestore();

  const [authState, setAuthState] = useState<{
    status: 'loading' | 'authenticated' | 'unauthenticated';
    data: User | null;
  }>({
    status: 'loading',
    data: null,
  });

  const [profileState, setProfileState] = useState<UserProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!auth) {
      setAuthState({ status: 'unauthenticated', data: null });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthState({ status: user ? 'authenticated' : 'unauthenticated', data: user });
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (authState.status !== 'authenticated' || !firestore) {
      setProfileState(null);
      return;
    }

    setProfileState(undefined); // Set profile to loading state
    const userDocRef = doc(firestore, 'users', authState.data!.uid);
    const unsubscribe = onSnapshot(userDocRef, docSnap => {
      if (docSnap.exists()) {
        setProfileState({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      } else {
        setProfileState(null); // Profile does not exist
      }
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setProfileState(null);
    });
    return () => unsubscribe();
  }, [authState, firestore]);

  if (authState.status === 'loading') {
    return { status: 'loading', data: null, profile: undefined, app };
  }
  if (authState.status === 'unauthenticated') {
    return { status: 'unauthenticated', data: null, profile: null, app };
  }
  return {
    status: 'authenticated',
    data: authState.data!,
    profile: profileState,
    app: app,
  };
}
