'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { mockConversations, type Conversation, type Message } from '@/lib/inbox-data';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';

interface InboxContextType {
  conversations: Conversation[];
  unreadCount: number;
  markAsRead: (conversationId: string) => void;
  markAsUnread: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  isLoading: boolean;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export function InboxProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore || user.status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    const loadConversations = async () => {
      try {
        const conversationsRef = collection(firestore, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', user.data.uid)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setIsLoading(false);
          return;
        }

        // Sort by lastMessageAt client-side (avoids requiring composite index)
        const sortedDocs = snapshot.docs.sort((a, b) => {
          const aTime = a.data().lastMessageAt?.toMillis?.() || 0;
          const bTime = b.data().lastMessageAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        const loaded: Conversation[] = [];

        for (const convDoc of sortedDocs) {
          const convData = convDoc.data();
          const otherUid = (convData.participants as string[]).find(
            (p: string) => p !== user.data.uid
          );
          const otherInfo = otherUid
            ? convData.participantInfo?.[otherUid]
            : null;

          // Load messages for this conversation
          const messagesRef = collection(firestore, 'conversations', convDoc.id, 'messages');
          let messagesSnapshot;
          try {
            const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
            messagesSnapshot = await getDocs(messagesQuery);
          } catch {
            // If orderBy fails (no index), fall back to unordered
            messagesSnapshot = await getDocs(messagesRef);
          }

          const messages: Message[] = messagesSnapshot.docs.map(msgDoc => {
            const msgData = msgDoc.data();
            return {
              id: msgDoc.id,
              sender: msgData.senderId === user.data.uid ? 'me' as const : 'them' as const,
              text: msgData.text || '',
              timestamp: msgData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            };
          });

          loaded.push({
            id: convDoc.id,
            name: otherInfo?.displayName || 'Unknown',
            role: otherInfo?.role || 'User',
            retreat: convData.lastMessageSnippet || '',
            lastMessage: convData.lastMessageSnippet || messages[messages.length - 1]?.text || '',
            avatar: otherInfo?.avatarUrl || '',
            unread: true,
            messages,
          });
        }

        if (loaded.length > 0) {
          setConversations(loaded);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [firestore, user.status]);

  const unreadCount = useMemo(() => {
    return conversations.filter(c => c.unread).length;
  }, [conversations]);

  const markAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unread: false } : c))
    );
  };

  const markAsUnread = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unread: true } : c))
    );
  };

  const sendMessage = async (conversationId: string, text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      timestamp: new Date().toISOString(),
    };

    // Optimistic update
    setConversations(prevConvos => {
      const targetConvo = prevConvos.find(c => c.id === conversationId);
      if (!targetConvo) return prevConvos;

      const updatedConvo = {
        ...targetConvo,
        messages: [...targetConvo.messages, newMessage],
        lastMessage: text,
        unread: false,
      };

      return [updatedConvo, ...prevConvos.filter(c => c.id !== conversationId)];
    });

    // Persist to Firestore if available
    if (firestore && user.status === 'authenticated') {
      try {
        const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
        await addDoc(messagesRef, {
          senderId: user.data.uid,
          text,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(firestore, 'conversations', conversationId), {
          lastMessageSnippet: text,
          lastMessageAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error sending message to Firestore:', error);
      }
    }
  };

  const value = {
    conversations,
    unreadCount,
    markAsRead,
    markAsUnread,
    sendMessage,
    isLoading,
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
