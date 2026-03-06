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
              HighVibe Retreats was created with a simple belief: the most meaningful experiences happen when the right people come together in the right place.
            </p>
            <p>
              Retreats have the power to change how we see ourselves, each other, and the world. But behind every transformative retreat is a network of people doing the real work: guides shaping the experience, hosts opening their spaces, vendors bringing local flavor and expertise, and seekers showing up ready for something meaningful.
            </p>
            <p>
              HighVibe Retreats exists to bring that entire ecosystem together.
            </p>
            <p>
              We’re not just another listing site. We’re building a marketplace designed specifically for retreats, a place where Seekers can discover experiences that truly resonate, and where Guides, Hosts, and Vendors can find each other faster, collaborate more easily, and build retreats with the support they deserve.
            </p>
            <p>
              When the right connections happen, something bigger unfolds. Retreat leaders spend less time chasing logistics and more time crafting meaningful experiences. Local businesses gain access to new opportunities. Communities benefit from thoughtful, place-based gatherings. And the people attending retreats find experiences that feel intentional rather than accidental.
            </p>
            <p>
              That’s the vision behind HighVibe: a network that works together to create something better than any one person could build alone.
            </p>
            <p>
              We believe great retreats aren’t just events, they’re collaborations.
            </p>
            <p>
              HighVibe Retreats is growing, and we’re grateful you’re here. Every person who joins helps strengthen the ecosystem and support the small businesses, local communities, and experience-makers who make these gatherings possible.
            </p>
            <p className="pt-4 text-center text-muted-foreground italic">
              Thank you for being part of what we’re building.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
