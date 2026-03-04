'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface ProposalFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matchId: string;
    manifestationId: string;
    seekerId: string;
    providerId: string;
    providerRole: string;
    destination: string;
}

export function ProposalForm({
    open,
    onOpenChange,
    matchId,
    manifestationId,
    seekerId,
    providerId,
    providerRole,
    destination,
}: ProposalFormProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [proposedPrice, setProposedPrice] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [highlights, setHighlights] = useState<string[]>(['']);

    const addHighlight = () => {
        if (highlights.length < 5) setHighlights([...highlights, '']);
    };

    const removeHighlight = (index: number) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    const updateHighlight = (index: number, value: string) => {
        const updated = [...highlights];
        updated[index] = value;
        setHighlights(updated);
    };

    const handleSubmit = async () => {
        if (!firestore || !message.trim() || !proposedPrice) return;

        setSubmitting(true);
        try {
            const price = parseFloat(proposedPrice);
            if (isNaN(price) || price <= 0) {
                toast({ title: 'Invalid price', variant: 'destructive' });
                setSubmitting(false);
                return;
            }

            const filteredHighlights = highlights.filter(h => h.trim());

            await addDoc(collection(firestore, 'proposals'), {
                match_id: matchId,
                manifestation_id: manifestationId,
                seeker_id: seekerId,
                provider_id: providerId,
                provider_role: providerRole,
                status: 'submitted',
                message: message.trim(),
                proposed_price: price,
                currency: 'USD',
                proposed_dates: startDate && endDate ? { start_date: startDate, end_date: endDate } : null,
                highlights: filteredHighlights,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
            });

            // Update match status
            await updateDoc(doc(firestore, 'matches', matchId), {
                status: 'proposal_sent',
            });

            // Send notification to seeker (fire-and-forget)
            fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: seekerId,
                    type: 'manifestation_match',
                    title: 'New Proposal Received!',
                    body: `A ${providerRole} submitted a $${price.toLocaleString()} proposal for your ${destination} retreat.`,
                    linkUrl: `/seeker/manifestations/${manifestationId}`,
                    metadata: { manifestationId, proposedPrice: price, providerRole },
                }),
            }).catch(() => {});

            toast({ title: 'Proposal submitted!', description: 'The seeker will be notified.' });
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to submit proposal:', err);
            toast({ title: 'Error', description: 'Could not submit proposal.', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Submit a Proposal</DialogTitle>
                    <DialogDescription>
                        Respond to this seeker&apos;s retreat request for {destination}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="message">Your Pitch</Label>
                        <Textarea
                            id="message"
                            placeholder="Tell the seeker why you're a great fit for their retreat..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="price">Proposed Price (USD)</Label>
                        <Input
                            id="price"
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="0.00"
                            value={proposedPrice}
                            onChange={e => setProposedPrice(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Proposed Start Date (optional)</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">Proposed End Date (optional)</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Highlights (up to 5)</Label>
                        <div className="space-y-2 mt-1">
                            {highlights.map((h, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        placeholder={`Highlight ${i + 1}`}
                                        value={h}
                                        onChange={e => updateHighlight(i, e.target.value)}
                                    />
                                    {highlights.length > 1 && (
                                        <Button variant="ghost" size="icon" onClick={() => removeHighlight(i)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {highlights.length < 5 && (
                                <Button variant="outline" size="sm" onClick={addHighlight}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Highlight
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting || !message.trim() || !proposedPrice}>
                        {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
