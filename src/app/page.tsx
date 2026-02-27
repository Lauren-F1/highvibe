
import HomePageClient from '@/components/home-page-client';
import { Suspense } from 'react';

/**
 * The root page component. 
 * We wrap HomePageClient in Suspense because it uses useSearchParams(),
 * which can cause startup hangs in Next.js 15 if not handled.
 */
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading HighVibe...</div>}>
      <HomePageClient />
    </Suspense>
  );
}
