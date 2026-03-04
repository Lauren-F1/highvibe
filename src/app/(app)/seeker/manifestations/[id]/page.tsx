'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, MapPin, Users, Sparkles, MessageSquare, Check, X, ChevronLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isFirebaseEnabled } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';

type Manifestation = {
    id: string;
    seeker_id: string;
    status: string;
    destination: { country: string; region?: string };
    retreat_types: string[];
    must_haves: string[];
    nice_to_haves: string[];
    group_size: number;
    budget_range: string;
    luxury_tier: string;
    lodging_preference: string;
    notes_text: string;
    matched_summary_counts: { guides: number; hosts: number; vendors: number };
};

type Match = {
    id: string;
    manifestation_id: string;
    seeker_id: string;
    provider_id: string;
    provider_role: 'guide' | 'host' | 'vendor';
    score: number;
    score_breakdown: {
        retreat_type_alignment: number;
        location_match: number;
        capacity_fit: number;
        vibe_compatibility: number;
    };
    match_reason: string;
    status: string;
};

type Proposal = {
    id: string;
    match_id: string;
    manifestation_id: string;
    provider_id: string;
    provider_role: string;
    status: string;
    message: string;
    proposed_price: number;
    proposed_dates: { start_date: string; end_date: string } | null;
    highlights: string[];
    created_at: any;
};

type ProviderProfile = {
    displayName: string;
    avatarUrl?: string;
    profileSlug?: string;
    headline?: string;
};

function ScoreBar({ score, max = 25, label }: { score: number; max?: number; label: string }) {
    const pct = Math.round((score / max) * 100);
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-24 sm:w-32 text-muted-foreground">{label}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right font-medium">{score}</span>
        </div>
    );
}

function MatchCard({
    match,
    provider,
    proposal,
    onStartConversation,
}: {
    match: Match;
    provider: ProviderProfile | null;
    proposal: Proposal | null;
    onStartConversation: (match: Match) => void;
}) {
    const roleBadgeColor = {
        guide: 'bg-blue-100 text-blue-800',
        host: 'bg-green-100 text-green-800',
        vendor: 'bg-purple-100 text-purple-800',
    }[match.provider_role];

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                        {provider?.displayName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{provider?.displayName || 'Provider'}</h3>
                            <Badge className={roleBadgeColor}>{match.provider_role}</Badge>
                        </div>
                        {provider?.headline && (
                            <p className="text-sm text-muted-foreground mb-2">{provider.headline}</p>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-bold text-primary text-lg">{match.score}% match</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{match.match_reason}</p>

                        <div className="space-y-1.5 mb-4">
                            <ScoreBar score={match.score_breakdown.retreat_type_alignment} label="Retreat Type" />
                            <ScoreBar score={match.score_breakdown.location_match} label="Location" />
                            <ScoreBar score={match.score_breakdown.capacity_fit} label="Capacity" />
                            <ScoreBar score={match.score_breakdown.vibe_compatibility} label="Vibe" />
                        </div>

                        {proposal && (
                            <>
                                <Separator className="my-4" />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">Proposal {proposal.status}</Badge>
                                        <span className="font-semibold">${proposal.proposed_price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm">{proposal.message}</p>
                                    {proposal.highlights.length > 0 && (
                                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                                            {proposal.highlights.map((h, i) => <li key={i}>{h}</li>)}
                                        </ul>
                                    )}
                                    {proposal.proposed_dates && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {proposal.proposed_dates.start_date} — {proposal.proposed_dates.end_date}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex gap-2 mt-4">
                            <Button size="sm" onClick={() => onStartConversation(match)}>
                                <MessageSquare className="h-4 w-4 mr-1" /> Message
                            </Button>
                            {provider?.profileSlug && (
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/u/${provider.profileSlug}`}>View Profile</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ManifestationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const user = useUser();
    const firestore = useFirestore();

    const id = params.id as string;

    const [manifestation, setManifestation] = useState<Manifestation | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [providers, setProviders] = useState<Record<string, ProviderProfile>>({});
    const [loading, setLoading] = useState(true);

    // Load manifestation
    useEffect(() => {
        if (!firestore || !id) return;

        const unsubscribe = onSnapshot(doc(firestore, 'manifestations', id), (snap) => {
            if (snap.exists()) {
                setManifestation({ id: snap.id, ...snap.data() } as Manifestation);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, id]);

    // Load matches
    useEffect(() => {
        if (!firestore || !id) return;

        const q = query(
            collection(firestore, 'matches'),
            where('manifestation_id', '==', id),
            orderBy('score', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Match));
            setMatches(data);

            // Fetch provider profiles
            const providerIds = [...new Set(data.map(m => m.provider_id))];
            for (const pid of providerIds) {
                if (!providers[pid]) {
                    getDoc(doc(firestore!, 'users', pid)).then((pSnap) => {
                        if (pSnap.exists()) {
                            setProviders(prev => ({
                                ...prev,
                                [pid]: pSnap.data() as ProviderProfile,
                            }));
                        }
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [firestore, id]);

    // Load proposals
    useEffect(() => {
        if (!firestore || !id) return;

        const q = query(
            collection(firestore, 'proposals'),
            where('manifestation_id', '==', id)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal)));
        });

        return () => unsubscribe();
    }, [firestore, id]);

    const handleStartConversation = async (match: Match) => {
        if (user.status !== 'authenticated' || !firestore) return;

        try {
            const provider = providers[match.provider_id];
            const providerName = provider?.displayName || 'Provider';

            // Check for existing conversation
            const convQuery = query(
                collection(firestore, 'conversations'),
                where('participants', 'array-contains', user.data.uid)
            );
            const convSnap = await getDocs(convQuery);
            const existing = convSnap.docs.find(d => {
                const participants = d.data().participants || [];
                return participants.includes(match.provider_id);
            });

            if (existing) {
                router.push('/inbox');
                return;
            }

            // Create new conversation
            const { addDoc: addDocFn, serverTimestamp } = await import('firebase/firestore');
            const userName = user.profile?.displayName || 'Seeker';

            await addDocFn(collection(firestore, 'conversations'), {
                participants: [user.data.uid, match.provider_id],
                participantInfo: {
                    [user.data.uid]: { displayName: userName, role: 'seeker' },
                    [match.provider_id]: { displayName: providerName, role: match.provider_role },
                },
                lastMessage: `Hi ${providerName}! I'm interested in your ${match.provider_role} services for my retreat.`,
                lastMessageAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                retreatContext: manifestation?.destination?.country || '',
            });

            toast({ title: 'Conversation started!', description: `You can now message ${providerName} in your inbox.` });
            router.push('/inbox');
        } catch (err) {
            console.error('Failed to start conversation:', err);
            toast({ title: 'Error', description: 'Could not start conversation.', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!manifestation) {
        notFound();
    }

    const isMatching = manifestation.status === 'submitted' || manifestation.status === 'matching';
    const hasMatches = matches.length > 0;
    const proposalsByMatch = new Map(proposals.map(p => [p.match_id, p]));
    const matchesWithProposals = matches.filter(m => proposalsByMatch.has(m.id));
    const matchesWithoutProposals = matches.filter(m => !proposalsByMatch.has(m.id));
    const destination = [manifestation.destination?.country, manifestation.destination?.region].filter(Boolean).join(', ');
    const counts = manifestation.matched_summary_counts || { guides: 0, hosts: 0, vendors: 0 };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            <Button variant="ghost" size="sm" asChild className="mb-4">
                <Link href="/seeker/manifestations"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Manifestations</Link>
            </Button>

            {/* Manifestation Summary */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-headline text-2xl">
                            <MapPin className="h-5 w-5 inline mr-1" />
                            {destination || 'Your Retreat'}
                        </CardTitle>
                        <Badge variant="secondary" className="capitalize">{manifestation.status.replace('_', ' ')}</Badge>
                    </div>
                    <CardDescription>
                        {manifestation.retreat_types?.join(', ')} &middot; {manifestation.group_size} guests &middot; {manifestation.budget_range || 'Flexible budget'}
                    </CardDescription>
                </CardHeader>
                {(manifestation.must_haves?.length > 0 || manifestation.nice_to_haves?.length > 0) && (
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {manifestation.must_haves?.map(h => (
                                <Badge key={h} variant="default">{h}</Badge>
                            ))}
                            {manifestation.nice_to_haves?.map(h => (
                                <Badge key={h} variant="outline">{h}</Badge>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Matching Status */}
            {isMatching && (
                <Card className="mb-6">
                    <CardContent className="text-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <h3 className="font-bold text-xl mb-2">Matching in progress</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Our AI is analyzing provider profiles to find the best matches for your dream retreat. This usually takes less than a minute.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Match Results */}
            {!isMatching && (
                <>
                    {hasMatches ? (
                        <>
                            <div className="flex items-center gap-4 mb-4">
                                <h2 className="font-headline text-xl">
                                    {matches.length} Match{matches.length !== 1 ? 'es' : ''} Found
                                </h2>
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                    {counts.guides > 0 && <span>{counts.guides} Guide{counts.guides !== 1 ? 's' : ''}</span>}
                                    {counts.hosts > 0 && <span>{counts.hosts} Host{counts.hosts !== 1 ? 's' : ''}</span>}
                                    {counts.vendors > 0 && <span>{counts.vendors} Vendor{counts.vendors !== 1 ? 's' : ''}</span>}
                                </div>
                            </div>

                            <Tabs defaultValue="matches">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="matches">All Matches ({matches.length})</TabsTrigger>
                                    <TabsTrigger value="proposals">
                                        Proposals ({matchesWithProposals.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="matches" className="space-y-4">
                                    {matches.map(match => (
                                        <MatchCard
                                            key={match.id}
                                            match={match}
                                            provider={providers[match.provider_id] || null}
                                            proposal={proposalsByMatch.get(match.id) || null}
                                            onStartConversation={handleStartConversation}
                                        />
                                    ))}
                                </TabsContent>

                                <TabsContent value="proposals" className="space-y-4">
                                    {matchesWithProposals.length === 0 ? (
                                        <Card>
                                            <CardContent className="text-center py-12">
                                                <p className="text-muted-foreground">No proposals received yet. Matched providers have been notified and may respond soon.</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        matchesWithProposals.map(match => (
                                            <MatchCard
                                                key={match.id}
                                                match={match}
                                                provider={providers[match.provider_id] || null}
                                                proposal={proposalsByMatch.get(match.id)!}
                                                onStartConversation={handleStartConversation}
                                            />
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-16">
                                <h3 className="font-bold text-xl mb-2">No matches yet</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    {manifestation.status === 'proposals_open'
                                        ? 'No providers matched your criteria at this time. Try broadening your requirements or check back later.'
                                        : 'Matching has not started yet for this manifestation.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
