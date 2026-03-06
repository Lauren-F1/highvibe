/**
 * Shared utility for managing provider-to-provider connections in Firestore.
 *
 * Schema: /connections/{connectionId}
 *   initiatorId: string
 *   initiatorRole: string
 *   partnerId: string
 *   partnerRole: string
 *   status: 'requested' | 'accepted' | 'declined'
 *   conversationId?: string
 *   retreatId?: string
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 */

import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export type ConnectionStatus = 'requested' | 'accepted' | 'declined';

export interface Connection {
  id: string;
  initiatorId: string;
  initiatorRole: string;
  partnerId: string;
  partnerRole: string;
  status: ConnectionStatus;
  conversationId?: string;
  retreatId?: string;
  createdAt: string;
}

/**
 * Load all connections for a user (as initiator or partner).
 */
export async function loadUserConnections(
  firestore: Firestore,
  userId: string
): Promise<Connection[]> {
  const connectionsRef = collection(firestore, 'connections');

  // Split into two queries to satisfy Firestore security rules
  // (rules check initiatorId OR partnerId, but or() queries can't be validated at query time)
  const [initiatorSnap, partnerSnap] = await Promise.all([
    getDocs(query(connectionsRef, where('initiatorId', '==', userId))),
    getDocs(query(connectionsRef, where('partnerId', '==', userId))),
  ]);

  const seen = new Set<string>();
  const results: Connection[] = [];

  for (const snap of [initiatorSnap, partnerSnap]) {
    for (const d of snap.docs) {
      if (seen.has(d.id)) continue;
      seen.add(d.id);
      const data = d.data();
      results.push({
        id: d.id,
        initiatorId: data.initiatorId,
        initiatorRole: data.initiatorRole,
        partnerId: data.partnerId,
        partnerRole: data.partnerRole,
        status: data.status,
        conversationId: data.conversationId,
        retreatId: data.retreatId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
      });
    }
  }

  return results;
}

/**
 * Get the connection status between two users. Returns null if no connection exists.
 */
export function getConnectionWith(
  connections: Connection[],
  userId: string,
  partnerId: string
): Connection | null {
  return connections.find(
    c =>
      (c.initiatorId === userId && c.partnerId === partnerId) ||
      (c.initiatorId === partnerId && c.partnerId === userId)
  ) || null;
}

/**
 * Create a new connection request. Returns the connection doc ID.
 */
export async function createConnection(
  firestore: Firestore,
  params: {
    initiatorId: string;
    initiatorRole: string;
    partnerId: string;
    partnerRole: string;
    conversationId?: string;
    retreatId?: string;
  }
): Promise<string> {
  const ref = await addDoc(collection(firestore, 'connections'), {
    ...params,
    status: 'requested',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update a connection's status (accept or decline).
 */
export async function updateConnectionStatus(
  firestore: Firestore,
  connectionId: string,
  status: ConnectionStatus,
  conversationId?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (conversationId) updates.conversationId = conversationId;
  await updateDoc(doc(firestore, 'connections', connectionId), updates);
}

/**
 * Derive a display status from connection data for UI rendering.
 */
export function getDisplayStatus(
  connections: Connection[],
  userId: string,
  partnerId: string
): 'Not Connected' | 'Invite Sent' | 'Connection Requested' | 'In Conversation' | 'Declined' {
  const conn = getConnectionWith(connections, userId, partnerId);
  if (!conn) return 'Not Connected';

  switch (conn.status) {
    case 'accepted':
      return 'In Conversation';
    case 'declined':
      return 'Declined';
    case 'requested':
      return conn.initiatorId === userId ? 'Invite Sent' : 'Connection Requested';
    default:
      return 'Not Connected';
  }
}
