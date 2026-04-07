import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { InboxProvider } from '@/context/InboxContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { Suspense } from 'react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1a1a',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'HighVibe Retreats | The Retreat Marketplace',
  description: 'Find your next escape. Or create one.',
  manifest: '/manifest.json',
  themeColor: '#1a1a1a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HighVibe',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: 'HighVibe Retreats',
    description: 'The Retreat Marketplace — Find your next escape, or create one.',
    siteName: 'HighVibe Retreats',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="font-body">
        <FirebaseClientProvider>
          <InboxProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </InboxProvider>
        </FirebaseClientProvider>
        <Toaster />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
