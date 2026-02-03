import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components'
import { Logo } from '@/components/icons/logo'; // Corrected import
import { SeekerIcon } from '@/components/icons/seeker-icon';
import { HostIcon } from '@/components/icons/host-icon';
import { VendorIcon } from '@/components/icons/vendor-icon';
import { SpaceOwnerIcon } from '@/components/icons/space-owner-icon';

function RoleCard({ href, icon, title, description }: RoleCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full w-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-primary">
        <CardHeader className="items-center text-center p-6">
          {icon}
          <CardTitle className="font-headline text-3xl mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6 pt-0">
          <CardDescription className="text-lg">{description}</CardDescription>

        </CardContent>
      </Card>
    </Link>
  );
}

interface RoleCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="text-center mb-12">
        <Logo />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-6xl">
        <RoleCard
          href="/seeker"
          icon={<SeekerIcon className="w-48 h-48 text-primary" />}
          title="I'm a Seeker"
          description="Discover unique retreats and experiences tailored to you."
        />
        <RoleCard
          href="/host"
          icon={<HostIcon className="w-48 h-48 text-primary" />}
          title="I'm a Host"
          description="List your retreat, connect with vendors, and manage bookings."
        />
        <RoleCard
          href="/vendor"
          icon={<VendorIcon className="w-48 h-48 text-primary" />}
          title="I'm a Vendor"
          description="Offer your services to retreat hosts and grow your business."
        />
        <RoleCard
          href="/space-owner"
          icon={<SpaceOwnerIcon className="w-48 h-48 text-primary" />}
          title="I'm a Space Owner"
          description="List your property for retreats and events to a global audience."
        />
      </div>
    </main>
  );
}
