import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <Link href="/" className="font-headline text-2xl font-bold text-foreground">
            RETREAT
          </Link>
          <p className="mt-4 text-sm text-muted-foreground sm:mt-0">
            © {new Date().getFullYear()} RETREAT Inc. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6 sm:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
