'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';

export interface AppNotification {
  id: string;
  userId: string;
  type: 'connection_request' | 'new_message' | 'booking_confirmation' | 'manifestation_match' | 'weekly_digest';
  title: string;
  body: string;
  linkUrl: string;
  read: boolean;
  emailSent: boolean;
  createdAt: Date;
  metadata?: {
    senderName?: string;
    senderAvatarUrl?: string;
    bookingId?: string;
    manifestationId?: string;
    conversationId?: string;
  };
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore || user.status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    const uid = user.data.uid;
    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: AppNotification[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          linkUrl: data.linkUrl,
          read: data.read || false,
          emailSent: data.emailSent || false,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          metadata: data.metadata,
        };
      });
      setNotifications(items);
      setIsLoading(false);
    }, (error) => {
      console.error('Notification listener error:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user.status]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!firestore) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    try {
      await updateDoc(doc(firestore, 'notifications', notificationId), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [firestore]);

  const markAllAsRead = useCallback(async () => {
    if (!firestore) return;

    const unreadNotifs = notifications.filter(n => !n.read);
    if (unreadNotifs.length === 0) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const batch = writeBatch(firestore);
      unreadNotifs.forEach(n => {
        batch.update(doc(firestore, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [firestore, notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  }), [notifications, unreadCount, markAsRead, markAllAsRead, isLoading]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
