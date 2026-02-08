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
              By using HighVibe, you agree to the terms below. These terms are designed to protect users, providers, and the integrity of the platform while we grow.
            </p>
            
            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Platform role</h3>
                <p>HighVibe is a marketplace that helps Seekers, Guides, Hosts, and Vendors discover and connect with one another. HighVibe is not the retreat operator unless explicitly stated for a specific experience.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Listings and accuracy</h3>
                <p>Users who list retreats, spaces, or services are responsible for ensuring their information is accurate, current, and lawful. HighVibe may remove listings that violate platform standards.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Connections and bookings</h3>
                <p>HighVibe may offer tools to request connections, communicate, or submit booking inquiries. Actual booking terms (pricing, availability, contracts, cancellation policies) are determined by the parties involved unless HighVibe explicitly provides booking infrastructure for that listing.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Payments</h3>
                <p>If HighVibe processes payments or charges fees for certain services, those terms will be presented clearly at the point of purchase or booking.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Community standards</h3>
                <p>You agree not to misuse the platform, spam users, misrepresent your identity, or engage in harmful, discriminatory, or illegal conduct.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Intellectual property</h3>
                <p>HighVibe’s brand, design, and platform content are protected. You may not copy or reproduce platform materials without permission.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Liability</h3>
                <p>HighVibe is not liable for outcomes resulting from retreats, services, or third-party interactions arranged through the platform. Users are responsible for their decisions and agreements.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Updates</h3>
                <p>These terms may be updated as the platform evolves. Continued use of HighVibe means you accept the latest version of these terms.</p>
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
