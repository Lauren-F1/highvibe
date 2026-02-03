import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6">
            <Image
              src="/logo.png"
              alt="High Vibe Retreats"
              width={140}
              height={50}
              priority
            />
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link href="/seeker" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Explore
            </Link>
            <Link href="/host" className="transition-colors hover:text-foreground/80 text-foreground/60">
              For Hosts
            </Link>
            <Link href="/vendor" className="transition-colors hover:text-foreground/80 text-foreground/60">
              For Vendors
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost">Log In</Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </header>
  );
}
