import { Logo } from '@/components/icons/logo';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl text-center mb-4">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <div className="w-full max-w-3xl space-y-16 py-8">
        {/* Intro */}
        <section className="text-center space-y-4">
          <h1 className="font-headline text-4xl md:text-5xl">
            How HighVibe Works
          </h1>
          <p className="text-lg text-beige-dark font-body max-w-2xl mx-auto">
            HighVibe Retreats is a marketplace that connects retreat seekers with the guides,
            spaces, and services that bring transformative experiences to life.
          </p>
        </section>

        {/* How You Get Matched */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl text-center">
            How You Get Matched
          </h2>
          <p className="text-base text-beige-dark font-body text-center max-w-2xl mx-auto">
            HighVibe doesn&apos;t just list retreats. It connects the right people with
            the right experiences using intelligent matching.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-beige bg-beige/10 p-6">
              <h3 className="font-headline text-xl mb-3">Smart Filters</h3>
              <p className="text-sm font-body text-muted-foreground">
                Seekers filter by location, retreat type, dates, price range, and
                more. Guides, hosts, and vendors show up in the results that
                matter most to them.
              </p>
            </div>
            <div className="rounded-xl border border-beige bg-beige/10 p-6">
              <h3 className="font-headline text-xl mb-3">AI Recommendations</h3>
              <p className="text-sm font-body text-muted-foreground">
                Our AI learns what seekers are looking for and surfaces retreats,
                spaces, and services they&apos;re most likely to love &mdash; even
                before they search.
              </p>
            </div>
            <div className="rounded-xl border border-beige bg-beige/10 p-6">
              <h3 className="font-headline text-xl mb-3">Proactive Matching</h3>
              <p className="text-sm font-body text-muted-foreground">
                The platform doesn&apos;t wait for searches. It connects seekers
                to guides, spaces to retreat leaders, and vendors to the events
                that need their services.
              </p>
            </div>
          </div>
        </section>

        {/* Your Dashboard */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl text-center">
            Your Dashboard
          </h2>
          <p className="text-base text-beige-dark font-body text-center max-w-2xl mx-auto">
            Every role gets a personalized dashboard designed for what they need most.
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border border-beige bg-beige/10 p-6">
              <h3 className="font-headline text-xl mb-2">Seekers</h3>
              <p className="text-sm font-body text-muted-foreground">
                Browse and save retreats. Get personalized recommendations. Manifest your
                dream retreat and let the platform match you with experiences that
                fit what you&apos;re looking for.
              </p>
            </div>
            <div className="rounded-xl border border-beige bg-beige/10 p-6">
              <h3 className="font-headline text-xl mb-2">Guides</h3>
              <p className="text-sm font-body text-muted-foreground">
                Create and manage your retreat listings. Find the right spaces and
                vendors. Connect with aligned seekers who are looking for exactly
                the kind of experience you lead.
              </p>
            </div>
            <div className="rounded-xl border border-beige bg-beige/10 p-6">
              <h3 className="font-headline text-xl mb-2">Hosts</h3>
              <p className="text-sm font-body text-muted-foreground">
                List your properties and retreat spaces. Get discovered by retreat
                leaders looking for a location that matches their vision. Manage
                bookings and availability from one place.
              </p>
            </div>
            <div className="rounded-xl border border-beige bg-beige/10 p-6">
              <h3 className="font-headline text-xl mb-2">Vendors</h3>
              <p className="text-sm font-body text-muted-foreground">
                Showcase your services &mdash; from wellness and catering to
                transportation and local experiences. Get booked by guides and
                hosts who are building retreats that need exactly what you offer.
              </p>
            </div>
          </div>
        </section>

        {/* What Early Access Means */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl text-center">
            What Early Access Means
          </h2>
          <div className="rounded-xl border border-beige bg-beige/10 p-6 space-y-4">
            <p className="text-base font-body text-beige-dark">
              As an early member, you&apos;ll be among the first to explore the
              platform when it opens. Here&apos;s what that looks like:
            </p>
            <ul className="space-y-3 text-sm font-body text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Set up your profile before the public launch so you&apos;re ready from day one.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                List your retreats, spaces, or services ahead of the crowd.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Be first to connect with other early members and start building relationships.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Shape the platform with your feedback as we grow.
              </li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <section className="text-center pb-8">
          <p className="text-sm text-muted-foreground font-body">
            Questions? Reach out to us at{' '}
            <a href="mailto:info@highviberetreats.com" className="underline text-primary">
              info@highviberetreats.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
