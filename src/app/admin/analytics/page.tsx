'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Compass, Home, Package, Mountain, CalendarCheck, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalSeekers: number;
    totalGuides: number;
    totalHosts: number;
    totalVendors: number;
    totalRetreats: number;
    totalBookings: number;
  };
  signupsByDay: Array<{ date: string; count: number }>;
  roleBreakdown: Array<{ role: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string; userId?: string }>;
}

const activityIcon = (type: string) => {
  switch (type) {
    case 'signup': return <Users className="h-4 w-4 text-muted-foreground" />;
    case 'retreat': return <Mountain className="h-4 w-4 text-muted-foreground" />;
    case 'booking': return <CalendarCheck className="h-4 w-4 text-muted-foreground" />;
    default: return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
  }
};

const formatRelativeTime = (iso: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function AdminAnalyticsPage() {
  const currentUser = useUser();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser.status !== 'authenticated') return;

    const fetchAnalytics = async () => {
      try {
        const token = await currentUser.data?.getIdToken();
        const res = await fetch('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch');
        setData(await res.json());
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentUser.status]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Failed to load analytics data.
      </div>
    );
  }

  const { summary, signupsByDay, roleBreakdown, recentActivity } = data;

  const statCards = [
    { title: 'Total Users', value: summary.totalUsers, icon: <Users className="h-4 w-4" /> },
    { title: 'Seekers', value: summary.totalSeekers, icon: <Compass className="h-4 w-4" /> },
    { title: 'Guides', value: summary.totalGuides, icon: <Mountain className="h-4 w-4" /> },
    { title: 'Hosts', value: summary.totalHosts, icon: <Home className="h-4 w-4" /> },
    { title: 'Vendors', value: summary.totalVendors, icon: <Package className="h-4 w-4" /> },
    { title: 'Retreats', value: summary.totalRetreats, icon: <Mountain className="h-4 w-4" /> },
    { title: 'Bookings', value: summary.totalBookings, icon: <CalendarCheck className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-3xl font-bold mb-6">Platform Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {statCards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Signups over time */}
        <Card>
          <CardHeader>
            <CardTitle>Signups (Last 30 Days)</CardTitle>
            <CardDescription>New user registrations per day</CardDescription>
          </CardHeader>
          <CardContent>
            {signupsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={signupsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12 text-muted-foreground">No signups in the last 30 days.</p>
            )}
          </CardContent>
        </Card>

        {/* Users by role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform events</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                  {activityIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{item.type}</Badge>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(item.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
