'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleStats {
  total: number;
  claimed: number;
  remaining: number;
}

interface FounderCodeStats {
  total: number;
  claimed: number;
  remaining: number;
  roles: {
    guide: RoleStats;
    host: RoleStats;
    vendor: RoleStats;
  };
}

const initialStats: FounderCodeStats = {
  total: 0,
  claimed: 0,
  remaining: 0,
  roles: {
    guide: { total: 0, claimed: 0, remaining: 0 },
    host: { total: 0, claimed: 0, remaining: 0 },
    vendor: { total: 0, claimed: 0, remaining: 0 },
  },
};

function StatCard({ title, value }: { title: string, value: number | string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-4xl">{value}</CardTitle>
            </CardHeader>
        </Card>
    )
}

export default function FounderCodesAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [stats, setStats] = useState<FounderCodeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFounderCodes = async () => {
      if (!firestore) return;
      setLoading(true);

      try {
        const codesQuery = query(collection(firestore, 'founder_codes'));
        const querySnapshot = await getDocs(codesQuery);
        
        const calculatedStats: FounderCodeStats = { ...initialStats, roles: {
            guide: { total: 0, claimed: 0, remaining: 0 },
            host: { total: 0, claimed: 0, remaining: 0 },
            vendor: { total: 0, claimed: 0, remaining: 0 },
        }};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const role = data.roleBucket as 'guide' | 'host' | 'vendor';
          const isClaimed = data.status === 'claimed';

          calculatedStats.total++;
          if (isClaimed) calculatedStats.claimed++;

          if (role && calculatedStats.roles[role]) {
            calculatedStats.roles[role].total++;
            if (isClaimed) calculatedStats.roles[role].claimed++;
          }
        });
        
        calculatedStats.remaining = calculatedStats.total - calculatedStats.claimed;
        calculatedStats.roles.guide.remaining = calculatedStats.roles.guide.total - calculatedStats.roles.guide.claimed;
        calculatedStats.roles.host.remaining = calculatedStats.roles.host.total - calculatedStats.roles.host.claimed;
        calculatedStats.roles.vendor.remaining = calculatedStats.roles.vendor.total - calculatedStats.roles.vendor.claimed;

        setStats(calculatedStats);

      } catch (error) {
        console.error("Error fetching founder codes:", error);
        toast({
          variant: "destructive",
          title: "Failed to fetch code stats",
          description: "Could not load data from Firestore.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFounderCodes();
  }, [firestore, toast]);
  
  if (loading) {
      return (
          <div className="container mx-auto px-4 py-8 md:py-12">
               <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                    </div>
                    <div className="border rounded-lg">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
              </Card>
          </div>
      )
  }

  if (!stats) {
      return (
          <div className="container mx-auto px-4 py-8 md:py-12">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-3xl font-headline">Founder Code Status</CardTitle>
                      <CardDescription>Could not load stats. Check the console for errors or try again.</CardDescription>
                  </CardHeader>
              </Card>
          </div>
      );
  }
  
  const roleStatsArray = [
      { role: 'Guide', ...stats.roles.guide },
      { role: 'Host', ...stats.roles.host },
      { role: 'Vendor', ...stats.roles.vendor },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Founder Code Status</CardTitle>
          <CardDescription>A real-time overview of the founder code inventory.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Codes" value={stats.total} />
                <StatCard title="Claimed" value={stats.claimed} />
                <StatCard title="Remaining" value={stats.remaining} />
            </div>

            <h3 className="font-headline text-2xl mb-4">Breakdown by Role</h3>
            <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Claimed</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roleStatsArray.map(item => (
                         <TableRow key={item.role}>
                            <TableCell className="font-medium">{item.role}</TableCell>
                            <TableCell className="text-right">{item.total}</TableCell>
                            <TableCell className="text-right">{item.claimed}</TableCell>
                            <TableCell className="text-right font-bold">{item.remaining}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
