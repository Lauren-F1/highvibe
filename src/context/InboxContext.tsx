'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef, ReactNode } from 'react';
import { mockConversations, type Conversation, type Message } from '@/lib/inbox-data';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';

interface InboxContextType {
  conversations: Conversation[];
  unreadCount: number;
  markAsRead: (conversationId: string) => void;
  markAsUnread: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  listenToMessages: (conversationId: string) => () => void;
  isLoading: boolean;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export function InboxProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();
  const firestore = useFirestore();
  const messageUnsubscribes = useRef<Map<string, () => void>>(new Map());

  // Real-time listener for conversation list
  useEffect(() => {
    if (!firestore || user.status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    const uid = user.data.uid;
    const conversationsRef = collection(firestore, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      const sortedDocs = snapshot.docs.sort((a, b) => {
        const aTime = a.data().lastMessageAt?.toMillis?.() || 0;
        const bTime = b.data().lastMessageAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setConversations(prev => {
        const updated: Conversation[] = sortedDocs.map(convDoc => {
          const convData = convDoc.data();
          const otherUid = (convData.participants as string[]).find(
            (p: string) => p !== uid
          );
          const otherInfo = otherUid
            ? convData.participantInfo?.[otherUid]
            : null;

          // Determine unread from Firestore timestamps
          const lastMessageAt = convData.lastMessageAt as Timestamp | undefined;
          const lastReadAt = convData.lastReadAt?.[uid] as Timestamp | undefined;
          const lastSenderId = convData.lastSenderId as string | undefined;

          let isUnread: boolean;
          if (lastSenderId === uid) {
            // I sent the last message, so it's not unread for me
            isUnread = false;
          } else if (!lastReadAt && lastMessageAt) {
            // Never read and there are messages = unread
            isUnread = true;
          } else if (lastReadAt && lastMessageAt) {
            isUnread = lastMessageAt.toMillis() > lastReadAt.toMillis();
          } else {
            isUnread = false;
          }

          // Preserve existing messages from local state
          const existing = prev.find(c => c.id === convDoc.id);

          return {
            id: convDoc.id,
            name: otherInfo?.displayName || 'Unknown',
            role: otherInfo?.role || 'User',
            retreat: convData.lastMessageSnippet || '',
            lastMessage: convData.lastMessageSnippet || existing?.lastMessage || '',
            avatar: otherInfo?.avatarUrl || '',
            unread: isUnread,
            messages: existing?.messages || [],
          };
        });

        return updated;
      });

      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to conversations:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user.status]);

  // Subscribe to real-time messages for a specific conversation
  const listenToMessages = useCallback((conversationId: string) => {
    // Already listening
    if (messageUnsubscribes.current.has(conversationId)) {
      return messageUnsubscribes.current.get(conversationId)!;
    }

    if (!firestore || user.status !== 'authenticated') {
      return () => {};
    }

    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    let messagesQuery;
    try {
      messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
    } catch {
      messagesQuery = query(messagesRef);
    }

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages: Message[] = snapshot.docs.map(msgDoc => {
        const msgData = msgDoc.data();
        return {
          id: msgDoc.id,
          sender: msgData.senderId === user.data.uid ? 'me' as const : 'them' as const,
          text: msgData.text || '',
          timestamp: msgData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });

      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, messages, lastMessage: messages[messages.length - 1]?.text || c.lastMessage }
            : c
        )
      );
    }, (error) => {
      console.error(`Error listening to messages for ${conversationId}:`, error);
    });

    messageUnsubscribes.current.set(conversationId, unsubscribe);

    return () => {
      unsubscribe();
      messageUnsubscribes.current.delete(conversationId);
    };
  }, [firestore, user.status]);

  // Cleanup all message listeners on unmount
  useEffect(() => {
    return () => {
      messageUnsubscribes.current.forEach(unsub => unsub());
      messageUnsubscribes.current.clear();
    };
  }, []);

  const unreadCount = useMemo(() => {
    return conversations.filter(c => c.unread).length;
  }, [conversations]);

  const markAsRead = (conversationId: string) => {
    // Optimistic local update
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unread: false } : c))
    );

    // Persist to Firestore
    if (firestore && user.status === 'authenticated') {
      const convRef = doc(firestore, 'conversations', conversationId);
      updateDoc(convRef, {
        [`lastReadAt.${user.data.uid}`]: serverTimestamp(),
      }).catch((e) => console.warn('Failed to update lastReadAt:', e));
    }
  };

  const markAsUnread = (conversationId: string) => {
    // Optimistic local update
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unread: true } : c))
    );

    // Persist to Firestore — set lastReadAt to epoch so it's before any message
    if (firestore && user.status === 'authenticated') {
      const convRef = doc(firestore, 'conversations', conversationId);
      updateDoc(convRef, {
        [`lastReadAt.${user.data.uid}`]: Timestamp.fromMillis(0),
      }).catch((e) => console.warn('Failed to update lastReadAt:', e));
    }
  };

  const sendMessage = async (conversationId: string, text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      timestamp: new Date().toISOString(),
    };

    // Optimistic update (will be replaced by onSnapshot)
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

    // Persist to Firestore
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
          lastSenderId: user.data.uid,
          [`lastReadAt.${user.data.uid}`]: serverTimestamp(),
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
    listenToMessages,
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
