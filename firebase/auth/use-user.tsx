
'use client';

import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth, useFirebaseApp, useFirestore } from '../provider';
import { FirebaseApp } from 'firebase/app';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { isFirebaseEnabled } from '../config';

export type User = FirebaseUser | {
  uid: string;
  email: string;
  displayName: string;
};

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

  // Seeker fields
  savedRetreatIds?: string[];
  
  // Notification/Manifestation Settings
  accepts_manifestations?: boolean;
  manifestation_notification_frequency?: 'immediate' | 'daily_digest';
  max_manifestations_per_week?: number;
  weekly_digest_enabled?: boolean;
  countries_served?: string[];

  createdAt?: any;
  lastLoginAt?: any;

  // Provider Agreement
  providerAgreementAccepted?: boolean;
  providerAgreementAcceptedAt?: any;
  providerAgreementVersion?: string;

  // Seeker Agreement
  seekerAgreementAccepted?: boolean;
  seekerAgreementAcceptedAt?: any;
  seekerAgreementVersion?: string;
  
  // Host Rider
  hostRiderAccepted?: boolean;
  hostRiderAcceptedAt?: any;
  hostRiderVersion?: string;
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

  const [userState, setUserState] = useState<Omit<AuthState, 'app'>>({
    status: 'loading',
    data: null,
    profile: undefined,
  });

  useEffect(() => {
    if (!isFirebaseEnabled) {
      // DEV AUTH MODE
      const handleStorageChange = () => {
        try {
            const devUserStr = localStorage.getItem('devUser');
            const devProfileStr = localStorage.getItem('devProfile');
            const devSavedRetreatsStr = localStorage.getItem('devSavedRetreats');

            if (devUserStr && devProfileStr) {
                const profile = JSON.parse(devProfileStr);
                if (devSavedRetreatsStr) {
                    profile.savedRetreatIds = JSON.parse(devSavedRetreatsStr);
                }
                setUserState({
                    status: 'authenticated',
                    data: JSON.parse(devUserStr),
                    profile: profile,
                });
            } else {
                setUserState({
                    status: 'unauthenticated',
                    data: null,
                    profile: null,
                });
            }
        } catch (e) {
            console.error('Error reading dev auth from localStorage', e);
            setUserState({ status: 'unauthenticated', data: null, profile: null });
        }
      };
      
      handleStorageChange(); // Initial load
      window.addEventListener('storage', handleStorageChange); // Listen for changes
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      }
    }

    // FIREBASE PROD MODE
    if (!auth || !firestore) {
      setUserState({ status: 'unauthenticated', data: null, profile: null });
      return;
    }

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUserState({ status: 'unauthenticated', data: null, profile: null });
        return;
      }

      // User is authenticated, now listen for profile changes
      setUserState(prevState => ({
          ...prevState,
          status: 'authenticated',
          data: user,
          profile: prevState.profile === null ? null : undefined, // set profile to loading
      }));

      const profileUnsubscribe = onSnapshot(doc(firestore, 'users', user.uid), 
        (docSnap) => {
          if (docSnap.exists()) {
            setUserState({
              status: 'authenticated',
              data: user,
              profile: { uid: docSnap.id, ...docSnap.data() } as UserProfile,
            });
          } else {
            setUserState({
              status: 'authenticated',
              data: user,
              profile: null, // Profile does not exist
            });
          }
        },
        (error) => {
          console.error("Error fetching user profile:", error);
          setUserState({
            status: 'authenticated',
            data: user,
            profile: null, // Error fetching profile
          });
        }
      );
      
      // Return a cleanup function that unsubscribes from the profile listener
      return () => profileUnsubscribe();
    });

    return () => authUnsubscribe();

  }, [auth, firestore]);

  return { ...userState, app };
}
