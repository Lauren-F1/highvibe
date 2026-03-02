'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ShieldAlert, Eye, Ban, CheckCircle, Bot } from 'lucide-react';

type FlaggedConversation = {
  id: string;
  conversationId: string;
  flaggedUserId: string;
  flaggedUserName: string;
  otherUserId: string;
  otherUserName: string;
  messageSnippet: string;
  riskScore: number;
  matchedCategories: string[];
  reasons: string[];
  aiConfirmed: boolean | null;
  aiReason: string | null;
  status: 'open' | 'reviewed' | 'dismissed' | 'actioned';
  createdAt: Timestamp;
};

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  reviewed: 'bg-yellow-100 text-yellow-800',
  dismissed: 'bg-gray-100 text-gray-800',
  actioned: 'bg-green-100 text-green-800',
};

export default function FlaggedConversationsPage() {
  const [flags, setFlags] = useState<FlaggedConversation[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) {
      setIsLoading(false);
      return;
    }

    const flagsRef = collection(firestore, 'flagged_conversations');
    const q = query(flagsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FlaggedConversation[];
      setFlags(data);
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading flagged conversations:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const updateStatus = async (flagId: string, status: FlaggedConversation['status']) => {
    if (!firestore) return;

    try {
      await updateDoc(doc(firestore, 'flagged_conversations', flagId), { status });
      toast({ title: `Flag marked as ${status}` });
      if (selectedFlag?.id === flagId) {
        setSelectedFlag((prev) => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating flag status:', error);
      toast({ variant: 'destructive', title: 'Failed to update status' });
    }
  };

  const openFlags = flags.filter((f) => f.status === 'open');
  const resolvedFlags = flags.filter((f) => f.status !== 'open');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-headline text-4xl font-bold">Flagged Conversations</h1>
        <p className="text-muted-foreground mt-2">Messages flagged for potential off-platform payment circumvention.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{openFlags.length}</div>
            <p className="text-sm text-muted-foreground">Open Flags</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{flags.filter((f) => f.aiConfirmed === true).length}</div>
            <p className="text-sm text-muted-foreground">AI Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{flags.filter((f) => f.status === 'actioned').length}</div>
            <p className="text-sm text-muted-foreground">Actioned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{flags.filter((f) => f.status === 'dismissed').length}</div>
            <p className="text-sm text-muted-foreground">Dismissed</p>
          </CardContent>
        </Card>
      </div>

      {/* Open flags table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Open Flags
          </CardTitle>
          <CardDescription>Requires review. Warning emails have already been sent to the flagged user.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : openFlags.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No open flags. All clear.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Flagged User</TableHead>
                  <TableHead>Other Party</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>AI</TableHead>
                  <TableHead>Reasons</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="text-sm">
                      {flag.createdAt?.toDate ? format(flag.createdAt.toDate(), 'MMM d, h:mm a') : '—'}
                    </TableCell>
                    <TableCell className="font-medium">{flag.flaggedUserName}</TableCell>
                    <TableCell>{flag.otherUserName}</TableCell>
                    <TableCell>
                      <Badge variant={flag.riskScore >= 5 ? 'destructive' : 'secondary'}>
                        {flag.riskScore}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {flag.aiConfirmed === true && (
                        <Badge className="bg-red-100 text-red-800 gap-1"><Bot className="h-3 w-3" /> Confirmed</Badge>
                      )}
                      {flag.aiConfirmed === false && (
                        <Badge className="bg-green-100 text-green-800 gap-1"><Bot className="h-3 w-3" /> Not confirmed</Badge>
                      )}
                      {flag.aiConfirmed === null && (
                        <Badge variant="outline" className="gap-1"><Bot className="h-3 w-3" /> Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{flag.reasons.join(', ')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => setSelectedFlag(flag)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(flag.id, 'dismissed')}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(flag.id, 'actioned')}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resolved flags */}
      {resolvedFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resolved Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Flagged User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="text-sm">
                      {flag.createdAt?.toDate ? format(flag.createdAt.toDate(), 'MMM d, h:mm a') : '—'}
                    </TableCell>
                    <TableCell className="font-medium">{flag.flaggedUserName}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[flag.status]}>{flag.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{flag.riskScore}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setSelectedFlag(flag)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedFlag} onOpenChange={(open) => !open && setSelectedFlag(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Flag Details</DialogTitle>
            <DialogDescription>
              Review the flagged message and take action.
            </DialogDescription>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Flagged User</p>
                  <p>{selectedFlag.flaggedUserName}</p>
                  <p className="text-xs text-muted-foreground">{selectedFlag.flaggedUserId}</p>
                </div>
                <div>
                  <p className="font-semibold">Other Party</p>
                  <p>{selectedFlag.otherUserName}</p>
                  <p className="text-xs text-muted-foreground">{selectedFlag.otherUserId}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm">Risk Score: {selectedFlag.riskScore}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedFlag.matchedCategories.map((cat) => (
                    <Badge key={cat} variant="outline">{cat}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm">Flagged Message</p>
                <blockquote className="mt-1 bg-secondary p-3 rounded-md text-sm border-l-4 border-destructive">
                  &ldquo;{selectedFlag.messageSnippet}&rdquo;
                </blockquote>
              </div>

              <div>
                <p className="font-semibold text-sm">Reasons</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                  {selectedFlag.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {selectedFlag.aiReason && (
                <div>
                  <p className="font-semibold text-sm flex items-center gap-1">
                    <Bot className="h-4 w-4" /> AI Analysis
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFlag.aiReason}</p>
                  <Badge className={selectedFlag.aiConfirmed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {selectedFlag.aiConfirmed ? 'Circumvention likely' : 'Likely false positive'}
                  </Badge>
                </div>
              )}

              <div>
                <p className="font-semibold text-sm">Status</p>
                <Badge className={statusColors[selectedFlag.status]}>{selectedFlag.status}</Badge>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => selectedFlag && updateStatus(selectedFlag.id, 'reviewed')}>
              Mark Reviewed
            </Button>
            <Button variant="outline" onClick={() => selectedFlag && updateStatus(selectedFlag.id, 'dismissed')}>
              Dismiss
            </Button>
            <Button variant="destructive" onClick={() => selectedFlag && updateStatus(selectedFlag.id, 'actioned')}>
              Take Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
