import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { DevAuthBanner } from '@/components/dev-auth-banner';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <DevAuthBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
