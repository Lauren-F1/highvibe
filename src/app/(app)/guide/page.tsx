import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { VendorCard } from '@/components/vendor-card';
import { placeholderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const yourRetreats = [
  { id: '1', name: 'Sunrise Yoga in Bali', status: 'Published', bookings: 12, income: 4800 },
  { id: '2', name: 'Silent Meditation in Kyoto', status: 'Draft', bookings: 0, income: 0 },
  { id: '3', name: 'Andes Hiking Adventure', status: 'Published', bookings: 8, income: 9600 },
];

const featuredVendors = [
  { id: '1', name: 'Elena Ray', service: 'Catering & Nutrition', rating: 4.9, reviewCount: 88, avatar: placeholderImages[7] },
  { id: '2', name: 'Sam Kolder', service: 'Photography & Videography', rating: 5.0, reviewCount: 120, avatar: placeholderImages[9]},
];

export default function GuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Guide Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your retreats and connect with service providers.</p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Retreat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>An overview of your current retreat listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Retreat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Total Income</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yourRetreats.map((retreat) => (
                    <TableRow key={retreat.id}>
                      <TableCell className="font-medium">{retreat.name}</TableCell>
                      <TableCell>
                        <Badge variant={retreat.status === 'Published' ? 'default' : 'secondary'}>{retreat.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{retreat.bookings}</TableCell>
                      <TableCell className="text-right">${retreat.income.toLocaleString()}</TableCell>
                      <TableCell><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Connect with Vendors</CardTitle>
              <CardDescription>Find services for your next retreat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
               <Button variant="outline" className="w-full">View All Vendors</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}