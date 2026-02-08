'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { getAuth } from 'firebase/auth';

export function Header() {
  const router = useRouter();
  const user = useUser();

  const handleLogout = () => {
    if (user.status === 'authenticated') {
        const auth = getAuth(user.app);
        auth.signOut().then(() => {
            router.push('/');
        });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6">
            <Image
              src="/logo.svg"
              alt="High Vibe Retreats"
              width={252}
              height={90}
              priority
            />
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link href="/seeker" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Seeker
            </Link>
            <Link href="/guide" className="transition-colors hover:text-foreground/80 text-foreground/60">
              For Guides
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
            {user.status === 'authenticated' ? (
                <>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/inbox">
                        <Mail className="h-5 w-5" />
                        <span className="sr-only">Inbox</span>
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/billing">Billing</Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                            <AvatarImage src={user.data.photoURL || undefined} alt="User avatar" />
                            <AvatarFallback>{user.data.displayName?.charAt(0) || user.data.email?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.data.displayName || 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.data.email}
                            </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/account">Account Settings</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/payouts">Payouts</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/support">Support</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            ) : (
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}
