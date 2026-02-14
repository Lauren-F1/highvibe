import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-4xl">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base font-body text-foreground/80">
            <p>
              By using HighVibe Retreats, you agree to the terms below. These terms are designed to protect users, providers, and the integrity of the platform while we grow.
            </p>
            
            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Platform role</h3>
                <p>HighVibe Retreats is a marketplace that helps Seekers, Guides, Hosts, and Vendors discover and connect with one another. HighVibe Retreats is not the retreat operator unless explicitly stated for a specific experience.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Listings and accuracy</h3>
                <p>Users who list retreats, spaces, or services are responsible for ensuring their information is accurate, current, and lawful. HighVibe Retreats may remove listings that violate platform standards.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Connections and bookings</h3>
                <p>HighVibe Retreats may offer tools to request connections, communicate, or submit booking inquiries. Actual booking terms (pricing, availability, contracts, cancellation policies) are determined by the parties involved unless HighVibe Retreats explicitly provides booking infrastructure for that listing.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Payments</h3>
                <p>If HighVibe Retreats processes payments or charges fees for certain services, those terms will be presented clearly at the point of purchase or booking.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Community standards</h3>
                <p>You agree not to misuse the platform, spam users, misrepresent your identity, or engage in harmful, discriminatory, or illegal conduct.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Intellectual property</h3>
                <p>HighVibe Retreats’s brand, design, and platform content are protected. You may not copy or reproduce platform materials without permission.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Liability</h3>
                <p>HighVibe Retreats is not liable for outcomes resulting from retreats, services, or third-party interactions arranged through the platform. Users are responsible for their decisions and agreements.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Updates</h3>
                <p>These terms may be updated as the platform evolves. Continued use of HighVibe Retreats means you accept the latest version of these terms.</p>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline text-3xl pt-8">Subscription, Fees, and Plan Changes</h2>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Subscriptions and billing cycles</h3>
                <p>Paid plans for Guides, Hosts, and Vendors are billed on a recurring basis. A “billing cycle” is the period covered by your subscription payment (for example, monthly from your start/renewal date until the next renewal date).</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Upgrades and downgrades</h3>
                <p>Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle (on your next renewal date), and your current plan remains active until that date.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Pro minimum commitment</h3>
                <p>Pro plans are intended for consistent operators and include a minimum commitment period of 90 days. During the commitment period, you may not downgrade out of Pro. If you request a downgrade during the commitment period, your downgrade will be scheduled for the first date you are eligible to downgrade.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Reactivation fee</h3>
                <p>If you downgrade from a Pro plan and then re-upgrade to a Pro plan within 60 days of the downgrade becoming effective, a one-time $99 reactivation fee will apply at the time of re-upgrade.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">On-platform payments required</h3>
                <p>All bookings and payments must be processed through HighVibe via Stripe. Off-platform payments are not supported. HighVibe may restrict accounts that attempt to solicit or process payments off-platform. Certain pricing, protections, and plan benefits apply only to on-platform transactions.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Platform fees and processing fees</h3>
                <p>Platform fees are calculated as a percentage of the applicable line-item subtotal (excluding taxes) and are collected by HighVibe. Stripe processing fees are paid by the applicable provider (Guide, Host, or Vendor) and may be deducted from the provider’s payout.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Fee locked at time of payment</h3>
                <p>For each booking, the platform fee rate applied is based on your plan tier at the moment the booking payment is successfully processed. The fee rate for an existing booking does not change if you later change plans.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Seeker Manifest Credit</h3>
                <p>Eligible Seekers may earn a “Manifest Credit” after completing a retreat booked and paid through HighVibe. The credit amount is equal to 3% of the completed retreat booking subtotal, up to $500. The credit is non-transferable, must be used within 12 months of issuance, and may be applied only to the Seeker’s next retreat booking (subject to the booking subtotal). Credits have no cash value and cannot be redeemed for cash.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Refunds and disputes</h3>
                <p>Refunds, disputes, and chargebacks may affect eligibility for credits and other benefits. HighVibe reserves the right to withhold, reverse, or void credits in cases of suspected fraud, abuse, or policy violations.</p>
            </div>

            <p className="pt-8 text-sm text-muted-foreground">
              Questions? Contact us at support@highviberetreats.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
