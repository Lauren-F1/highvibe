'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
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
        const auth = getAuth(user.app!);
        auth.signOut().then(() => {
            router.push('/');
        });
    }
  };

  const userInitial = user.status === 'authenticated'
    ? user.profile?.displayName?.charAt(0) || user.data.email?.charAt(0) || 'U'
    : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6">
            <Image
              src="/logo.svg"
              alt="HighVibe Retreats"
              width={252}
              height={90}
              priority
            />
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link href="/seeker" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Seeker
            </Link>
            <Link href='/guide' className="transition-colors hover:text-foreground/80 text-foreground/60">
              For Guides
            </Link>
            <Link href='/host' className="transition-colors hover:text-foreground/80 text-foreground/60">
              For Hosts
            </Link>
             <Link href='/vendor' className="transition-colors hover:text-foreground/80 text-foreground/60">
              For Vendors
            </Link>
             <Link href='/inbox' className="transition-colors hover:text-foreground/80 text-foreground/60">
              Inbox
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
            {user.status === 'authenticated' ? (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user.profile?.avatarUrl} alt={user.profile?.displayName} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                            </Avatar>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.profile?.displayName || 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.data.email}
                            </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/account">Profile</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/billing">Billing</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            ) : (
                 <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/join">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>
      </div>
    </header>
  );
}
