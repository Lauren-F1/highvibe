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

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app with authentication, you would call a sign-out function here.
    // For now, we will just redirect to the home page.
    router.push('/');
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
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="User avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Guide User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        guide@example.com
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
        </div>
      </div>
    </header>
  );
}
