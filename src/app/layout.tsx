import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { InboxProvider } from '@/context/InboxContext';

export const metadata: Metadata = {
  title: 'Retreat and Relax',
  description: 'Find your next escape. Or create one.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className='font-body'>
        <FirebaseClientProvider>
          <InboxProvider>
            {children}
          </InboxProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
