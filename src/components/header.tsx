
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { getAuth, User as FirebaseUser } from 'firebase/auth';
import { isFirebaseEnabled } from '@/firebase/config';
import { useInbox } from '@/context/InboxContext';
import { NotificationBell } from '@/components/notification-bell';
import { useEffect, useState } from 'react';
import { Logo } from './icons/logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';


export function Header() {
  const router = useRouter();
  const user = useUser();
  const { unreadCount } = useInbox();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (user.status === 'authenticated') {
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
      
      const userEmail = user.data.email?.toLowerCase();
      const isAdminByEmail = userEmail ? adminEmails.includes(userEmail) : false;

      if (user.data && typeof (user.data as any).getIdTokenResult === 'function') {
          (user.data as FirebaseUser).getIdTokenResult().then(idTokenResult => {
            if (idTokenResult.claims.admin === true || isAdminByEmail) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          });
      } else {
        if (isAdminByEmail) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
      }
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogout = () => {
    document.cookie = 'isAdminBypass=; path=/; max-age=0'; // Clear admin bypass cookie

    if (!isFirebaseEnabled) {
      // DEV AUTH MODE
      localStorage.removeItem('devUser');
      localStorage.removeItem('devProfile');
      router.push('/');
      router.refresh();
      return;
    }

    // PROD FIREBASE MODE
    if (user.status === 'authenticated' && user.app) {
        const auth = getAuth(user.app);
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
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] pt-12">
              <nav className="flex flex-col space-y-4 font-ui text-base">
                <Link href="/seeker" className="py-2 transition-colors hover:text-foreground/80 text-foreground/60" onClick={() => setMobileMenuOpen(false)}>
                  Seeker
                </Link>
                <Link href="/guide" className="py-2 transition-colors hover:text-foreground/80 text-foreground/60" onClick={() => setMobileMenuOpen(false)}>
                  For Guides
                </Link>
                <Link href="/host" className="py-2 transition-colors hover:text-foreground/80 text-foreground/60" onClick={() => setMobileMenuOpen(false)}>
                  For Hosts
                </Link>
                <Link href="/vendor" className="py-2 transition-colors hover:text-foreground/80 text-foreground/60" onClick={() => setMobileMenuOpen(false)}>
                  For Vendors
                </Link>
                <Link href="/inbox" className="relative py-2 transition-colors hover:text-foreground/80 text-foreground/60" onClick={() => setMobileMenuOpen(false)}>
                  Inbox
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user.status === 'authenticated' && (
                  <>
                    <div className="border-t pt-4 mt-2" />
                    <Link href="/account" className="py-2 transition-colors hover:text-foreground/80 text-foreground/60" onClick={() => setMobileMenuOpen(false)}>
                      Profile
                    </Link>
                    <Link href="/billing" className="py-2 transition-colors hover:text-foreground/80 text-foreground/60" onClick={() => setMobileMenuOpen(false)}>
                      Billing
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="mr-6">
            <Logo className="w-[252px] h-[63px]" />
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex font-ui">
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
             <Link href='/inbox' className="relative transition-colors hover:text-foreground/80 text-foreground/60">
              Inbox
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-4 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
            {user.status === 'authenticated' ? (
                <>
                    <NotificationBell />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user.profile?.avatarUrl} alt={user.profile?.displayName} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                            </Avatar>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 font-ui" align="end" forceMount>
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
                        {isAdmin && (
                          <DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Admin</DropdownMenuLabel>
                              <DropdownMenuItem asChild><Link href="/admin/waitlist">Waitlist</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/admin/contact">Contact Submissions</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/admin/founder-codes">Founder Codes</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/admin/chargebacks">Chargebacks</Link></DropdownMenuItem>
                          </DropdownMenuGroup>
                        )}
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
