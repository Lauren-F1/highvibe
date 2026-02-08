import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-4xl">About HighVibe Retreats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg font-body text-foreground/80">
            <p>
              HighVibe Retreats is a marketplace built for retreats — not just listings. We connect Seekers with experiences that feel aligned, and we help Guides, Hosts, and Vendors find each other faster, with less friction and more trust.
            </p>
            <p>
              We’re building a platform where the right people can meet, plan, and book with confidence — so the logistics don’t dilute the magic. Whether you’re attending a retreat, leading one, offering services, or listing a space, HighVibe Retreats is designed to help you get discovered and get booked.
            </p>
            <div>
              <h3 className="font-headline text-2xl mt-8 mb-4">What we stand for</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Clarity over clutter</li>
                <li>Trust over volume</li>
                <li>Quality connections over endless searching</li>
                <li>A marketplace that supports the people doing the real work behind the experience</li>
              </ul>
            </div>
            <p className="pt-8 text-center text-muted-foreground italic">
              HighVibe Retreats is growing, and we’re grateful you’re here. Your participation helps shape what this becomes. Thank you for being part of the community that brings it to life.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
