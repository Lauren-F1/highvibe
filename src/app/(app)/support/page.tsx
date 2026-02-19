import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-4xl">Support & FAQ</CardTitle>
            <CardDescription>
              Have a question? We’re here to help. You can reach us by email at <a href="mailto:info@highviberetreats.com" className="text-primary hover:underline">info@highviberetreats.com</a> or by using our <Link href="/contact" className="text-primary hover:underline">contact form</Link>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-headline text-2xl mb-4">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is HighVibe Retreats?</AccordionTrigger>
                <AccordionContent className="space-y-4 text-base leading-relaxed">
                  <p>HighVibe Retreats is a marketplace designed to connect the right people for creating and attending transformative retreats. We help Seekers find experiences, and we provide Guides, Hosts, and Vendors with the tools to collaborate and get booked.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I become a Guide, Host, or Vendor?</AccordionTrigger>
                <AccordionContent className="space-y-4 text-base leading-relaxed">
                  <p>We're so glad you're interested! During our pre-launch phase, the best way to get involved is to <Link href="/#join" className="text-primary hover:underline">join the waitlist</Link>. Select the role you're interested in, and you'll be among the first to receive an invitation when we open up onboarding for providers.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>When will the platform launch?</AccordionTrigger>
                <AccordionContent className="space-y-4 text-base leading-relaxed">
                  <p>We are currently in a pre-launch phase with a select group of founding members. A wider public launch is planned for later this year. Join the waitlist to be notified and receive an invitation as soon as we open up access.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
