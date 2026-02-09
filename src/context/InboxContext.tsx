'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { isFirebaseEnabled } from '@/firebase/config';
import { mockConversations, type Conversation } from '@/lib/inbox-data';

// In a real app, you would also import Firebase-related modules
// import { useUser } from '@/firebase';
// import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface InboxContextType {
  conversations: Conversation[];
  unreadCount: number;
  markAsRead: (conversationId: string) => void;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export function InboxProvider({ children }: { children: ReactNode }) {
  // For this example, we'll use local state to manage the mock data.
  // In a real application, this would be synchronized with Firestore.
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  
  // const user = useUser();
  // const firestore = useFirestore();

  // useEffect(() => {
  //   if (isFirebaseEnabled && user.status === 'authenticated' && firestore) {
  //     const q = query(collection(firestore, 'conversations'), where('participants', 'array-contains', user.data.uid));
  //     const unsubscribe = onSnapshot(q, (snapshot) => {
  //       // Logic to map firestore docs to Conversation[] and update state
  //     });
  //     return () => unsubscribe();
  //   }
  // }, [user, firestore]);

  const unreadCount = useMemo(() => {
    return conversations.filter(c => c.unread).length;
  }, [conversations]);

  const markAsRead = (conversationId: string) => {
    // In a real app, this would also update the document in Firestore.
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unread: false } : c))
    );
  };

  const value = {
    conversations,
    unreadCount,
    markAsRead,
  };

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const context = useContext(InboxContext);
  if (context === undefined) {
    throw new Error('useInbox must be used within an InboxProvider');
  }
  return context;
}
