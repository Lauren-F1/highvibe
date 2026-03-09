export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="w-full max-w-3xl mx-auto space-y-16">
        {/* Intro */}
        <section className="text-center space-y-4">
          <h1 className="font-headline text-2xl sm:text-3xl md:text-5xl">
            How HighVibe Works
          </h1>
        </section>

        {/* Main explanation */}
        <section>
          <div className="rounded-xl border border-beige bg-beige/10 p-8 space-y-6">
            <p className="text-base font-body text-[#3d3b3a] leading-relaxed">
              HighVibe Retreats is a marketplace designed for everyone it takes to create a
              transformative retreat &mdash; Seekers, Guides, Hosts, and Vendors &mdash; connected
              in one shared ecosystem.
            </p>
            <p className="text-base font-body text-[#3d3b3a] leading-relaxed">
              Whether you&apos;re looking for your next retreat, leading one, offering your space,
              or providing a service, you create a profile and HighVibe makes the right
              introductions. Guides planning a retreat tell us what they need and where they want
              to go. We don&apos;t limit possibilities to who is already on the platform. HighVibe
              identifies aligned local businesses and providers in that region, invites them into
              the ecosystem, and makes the introduction for you so each retreat has the right
              support.
            </p>
            <p className="text-base font-body text-[#3d3b3a] leading-relaxed">
              Seekers do the same. Share what you&apos;re looking for, and we connect you with
              retreats and partners that fit, including experiences you may not have discovered
              on your own.
            </p>
            <p className="text-base font-body text-[#3d3b3a] leading-relaxed">
              Unlike platforms that simply list retreats and leave discovery to chance, HighVibe
              actively builds the connections behind every experience, introducing the right
              guides to the right spaces, the right vendors to the right retreats, and the right
              seekers to the right journeys.
            </p>
            <p className="text-base font-body text-[#3d3b3a] leading-relaxed">
              Each introduction strengthens the network, directs opportunity back to local
              communities, and elevates the quality of future retreats.
            </p>
            <p className="text-base font-body text-[#3d3b3a] leading-relaxed">
              HighVibe is built by retreat leaders who understand both sides of the experience.
              Pricing is transparent. Standards are clear. As an early member, you&apos;re not
              just joining a marketplace &mdash; you&apos;re helping shape an ecosystem.
            </p>
          </div>
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
    </div>
  );
}
