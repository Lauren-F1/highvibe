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

export function Header() {
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
              Explore
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://picsum.photos/seed/human/100/100" alt="User avatar" />
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
                  <DropdownMenuItem asChild><Link href="#">Account</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/billing">Billing</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="#">Support</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
