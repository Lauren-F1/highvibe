import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-headline text-6xl md:text-8xl text-primary mb-4">404</h1>
        <h2 className="font-headline text-2xl md:text-3xl mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
