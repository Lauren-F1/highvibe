'use client';

import { useDoc } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';

export default function ManifestationDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: manifestation, loading } = useDoc(`manifestations/${id}`);

    if (loading) {
        return <div className="container mx-auto px-4 py-12 text-center">Loading Manifestation...</div>;
    }

    if (!manifestation) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">
                        Your Manifestation for {manifestation.destination.country}
                    </CardTitle>
                    <CardDescription>
                        Status: <span className="capitalize font-medium text-primary">{manifestation.status}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-16">
                    <h3 className="font-bold text-xl mb-2">Matching in progress</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Our network of guides, hosts, and vendors are reviewing your request. We’ll notify you as soon as proposals start coming in.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
