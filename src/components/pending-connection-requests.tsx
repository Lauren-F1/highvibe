'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, MessageSquare, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { updateConnectionStatus, type Connection } from '@/lib/firestore-connections';

interface PendingRequest extends Connection {
  initiatorName?: string;
  initiatorHeadline?: string;
}

export function PendingConnectionRequests({
  connections,
  onConnectionUpdated,
}: {
  connections: Connection[];
  onConnectionUpdated: () => void;
}) {
  const user = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const uid = user.status === 'authenticated' ? user.data?.uid : null;

  // Filter to only incoming pending requests
  useEffect(() => {
    if (!uid || !firestore) return;

    const incoming = connections.filter(
      (c) => c.status === 'requested' && c.partnerId === uid
    );

    // Fetch initiator profiles
    Promise.all(
      incoming.map(async (conn) => {
        try {
          const profileDoc = await getDoc(doc(firestore, 'users', conn.initiatorId));
          const data = profileDoc.exists() ? profileDoc.data() : {};
          return {
            ...conn,
            initiatorName: data?.displayName || 'Unknown',
            initiatorHeadline: data?.headline || '',
          };
        } catch {
          return { ...conn, initiatorName: 'Unknown' };
        }
      })
    ).then(setPendingRequests);
  }, [connections, uid, firestore]);

  if (pendingRequests.length === 0) return null;

  const handleAccept = async (conn: PendingRequest) => {
    if (!firestore) return;
    setProcessingId(conn.id);
    try {
      await updateConnectionStatus(firestore, conn.id, 'accepted');
      toast({ title: 'Connection accepted!', description: `You're now connected with ${conn.initiatorName}.` });
      onConnectionUpdated();
      if (conn.conversationId) {
        router.push('/inbox');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Could not accept connection.', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (conn: PendingRequest) => {
    if (!firestore) return;
    setProcessingId(conn.id);
    try {
      await updateConnectionStatus(firestore, conn.id, 'declined');
      toast({ title: 'Connection declined' });
      onConnectionUpdated();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not decline connection.', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const roleBadgeColor: Record<string, string> = {
    guide: 'bg-blue-100 text-blue-800',
    host: 'bg-green-100 text-green-800',
    vendor: 'bg-purple-100 text-purple-800',
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          Incoming Requests ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingRequests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                {req.initiatorName?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{req.initiatorName}</p>
                <div className="flex items-center gap-2">
                  <Badge className={roleBadgeColor[req.initiatorRole] || 'bg-gray-100 text-gray-800'} variant="secondary">
                    {req.initiatorRole}
                  </Badge>
                  {req.initiatorHeadline && (
                    <span className="text-xs text-muted-foreground truncate">{req.initiatorHeadline}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {processingId === req.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Button size="sm" onClick={() => handleAccept(req)}>
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDecline(req)}>
                    <X className="h-4 w-4 mr-1" /> Decline
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
