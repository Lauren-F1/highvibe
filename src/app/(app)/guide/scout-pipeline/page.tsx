'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, CheckCircle, Eye, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

type OutreachRecord = {
    id: string;
    vendorName: string;
    vendorEmail: string;
    vendorCategory: string;
    location: string;
    status: 'sent' | 'opened' | 'signed_up' | 'followed_up';
    sentAt: any;
    openedAt: any;
    signedUpAt: any;
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: typeof Mail }> = {
    sent: { label: 'Sent', variant: 'outline', icon: Mail },
    followed_up: { label: 'Followed Up', variant: 'secondary', icon: Mail },
    opened: { label: 'Opened', variant: 'secondary', icon: Eye },
    signed_up: { label: 'Signed Up', variant: 'default', icon: UserPlus },
};

export default function ScoutPipelinePage() {
    const user = useUser();
    const firestore = useFirestore();
    const [records, setRecords] = useState<OutreachRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user.status !== 'authenticated' || !firestore) {
            setLoading(false);
            return;
        }

        const loadOutreach = async () => {
            try {
                const q = query(
                    collection(firestore, 'scout_outreach'),
                    where('guideUserId', '==', user.data.uid),
                    orderBy('sentAt', 'desc')
                );
                const snap = await getDocs(q);
                setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as OutreachRecord)));
            } catch (err) {
                console.error('Error loading scout outreach:', err);
            }
            setLoading(false);
        };

        loadOutreach();
    }, [user.status, user.data?.uid, firestore]);

    const sentCount = records.length;
    const openedCount = records.filter(r => r.status === 'opened' || r.status === 'signed_up').length;
    const signedUpCount = records.filter(r => r.status === 'signed_up').length;

    if (loading) {
        return <div className="container mx-auto px-4 py-12 text-center">Loading pipeline...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">Scout Pipeline</h1>
            <p className="text-muted-foreground mb-8">Track your vendor outreach and conversion funnel.</p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{sentCount}</p>
                            <p className="text-sm text-muted-foreground">Emails Sent</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{openedCount}</p>
                            <p className="text-sm text-muted-foreground">Opened</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{signedUpCount}</p>
                            <p className="text-sm text-muted-foreground">Signed Up</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            {records.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16">
                        <p className="text-muted-foreground">No outreach sent yet. Use the Scout tool on your dashboard to find and contact local vendors.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Outreach History</CardTitle>
                        <CardDescription>{records.length} vendor{records.length !== 1 ? 's' : ''} contacted</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map(record => {
                                    const config = statusConfig[record.status] || statusConfig.sent;
                                    return (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{record.vendorName}</p>
                                                    <p className="text-xs text-muted-foreground">{record.vendorEmail}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{record.vendorCategory}</TableCell>
                                            <TableCell>{record.location}</TableCell>
                                            <TableCell>
                                                <Badge variant={config.variant}>{config.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {record.sentAt?.toDate ? format(record.sentAt.toDate(), 'MMM d, yyyy') : '—'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
