import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { DevAuthBanner } from '@/components/dev-auth-banner';
import { EmailVerificationBanner } from '@/components/email-verification-banner';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <DevAuthBanner />
      <EmailVerificationBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
