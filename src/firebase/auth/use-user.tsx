'use client';

import { Auth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth, useFirebaseApp } from '../provider';
import { FirebaseApp } from 'firebase/app';

export type User = FirebaseUser;

export type AuthState =
  | {
      status: 'loading';
      data: null;
      app: FirebaseApp;
    }
  | {
      status: 'authenticated';
      data: User;
      app: FirebaseApp;
    }
  | {
      status: 'unauthenticated';
      data: null;
      app: FirebaseApp;
    };

export function useUser(): AuthState {
  const app = useFirebaseApp();
  const auth = useAuth();
  const [userState, setUserState] = useState<AuthState>({
    status: 'loading',
    data: null,
    app,
  });

  useEffect(() => {
    if (!auth) {
      // This can happen on first render if Firebase isn't initialized yet.
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserState({ status: 'authenticated', data: user, app });
      } else {
        setUserState({ status: 'unauthenticated', data: null, app });
      }
    });

    return () => unsubscribe();
  }, [auth, app]);

  return userState;
}
