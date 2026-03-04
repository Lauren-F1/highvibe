'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, MapPin, Users, Calendar } from 'lucide-react';
import { ProposalForm } from '@/components/proposal-form';

type Match = {
    id: string;
    manifestation_id: string;
    seeker_id: string;
    provider_id: string;
    provider_role: string;
    score: number;
    match_reason: string;
    status: string;
};

type ManifestationSummary = {
    destination: { country: string; region?: string };
    retreat_types: string[];
    group_size: number;
    budget_range: string;
    luxury_tier: string;
    date_pref: { type: string; start_date?: any; end_date?: any; month?: string; season?: string };
};

export function ManifestationOpportunities() {
    const user = useUser();
    const firestore = useFirestore();
    const [matches, setMatches] = useState<Match[]>([]);
    const [manifestations, setManifestations] = useState<Record<string, ManifestationSummary>>({});
    const [loading, setLoading] = useState(true);
    const [proposalForm, setProposalForm] = useState<{
        open: boolean;
        matchId: string;
        manifestationId: string;
        seekerId: string;
        destination: string;
    } | null>(null);

    useEffect(() => {
        if (user.status !== 'authenticated' || !firestore) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(firestore, 'matches'),
            where('provider_id', '==', user.data.uid),
            where('status', 'in', ['pending', 'notified'])
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Match));
            setMatches(data);

            // Fetch manifestation summaries
            const manifestationIds = [...new Set(data.map(m => m.manifestation_id))];
            for (const mid of manifestationIds) {
                if (!manifestations[mid]) {
                    getDoc(doc(firestore!, 'manifestations', mid)).then((mSnap) => {
                        if (mSnap.exists()) {
                            setManifestations(prev => ({
                                ...prev,
                                [mid]: mSnap.data() as ManifestationSummary,
                            }));
                        }
                    });
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [user.status, user.data?.uid, firestore]);

    if (loading || matches.length === 0) return null;

    const providerRole = matches[0]?.provider_role || 'guide';

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Seeker Opportunities ({matches.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {matches.map(match => {
                        const m = manifestations[match.manifestation_id];
                        const destination = m ? [m.destination?.country, m.destination?.region].filter(Boolean).join(', ') : 'Loading...';

                        return (
                            <Card key={match.id} className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">{destination}</span>
                                                <Badge variant="secondary">{match.score}% match</Badge>
                                            </div>
                                            {m && (
                                                <>
                                                    <p className="text-sm text-muted-foreground">
                                                        {m.retreat_types?.join(', ')}
                                                    </p>
                                                    <div className="flex gap-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3.5 w-3.5" /> {m.group_size} guests
                                                        </span>
                                                        {m.budget_range && <span>{m.budget_range}</span>}
                                                        {m.luxury_tier && <span>{m.luxury_tier}</span>}
                                                    </div>
                                                </>
                                            )}
                                            <p className="text-sm">{match.match_reason}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => setProposalForm({
                                                open: true,
                                                matchId: match.id,
                                                manifestationId: match.manifestation_id,
                                                seekerId: match.seeker_id,
                                                destination,
                                            })}
                                        >
                                            Respond
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </CardContent>
            </Card>

            {proposalForm && user.status === 'authenticated' && (
                <ProposalForm
                    open={proposalForm.open}
                    onOpenChange={(open) => setProposalForm(open ? proposalForm : null)}
                    matchId={proposalForm.matchId}
                    manifestationId={proposalForm.manifestationId}
                    seekerId={proposalForm.seekerId}
                    providerId={user.data.uid}
                    providerRole={providerRole}
                    destination={proposalForm.destination}
                />
            )}
        </>
    );
}
