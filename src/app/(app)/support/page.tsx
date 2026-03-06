import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';

const faqs = [
  {
    question: "What is HighVibe Retreats?",
    answer: (
      <p>HighVibe Retreats is a marketplace designed specifically for retreats. It connects the people needed to create meaningful retreat experiences — Seekers, Guides, Hosts, and Vendors — in one shared ecosystem. Instead of relying on scattered messages, directories, and personal networks, HighVibe brings everyone into one place so retreats can be discovered, planned, and booked with greater clarity and trust.</p>
    ),
  },
  {
    question: "Who is HighVibe Retreats for?",
    answer: (
      <>
        <p>HighVibe is designed for four types of participants:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Seekers</strong> — people looking to attend retreats</li>
          <li><strong>Guides</strong> — leaders creating and hosting retreats</li>
          <li><strong>Hosts</strong> — retreat-ready properties and venues</li>
          <li><strong>Vendors</strong> — professionals who support retreats (chefs, facilitators, photographers, transportation, wellness providers, and more)</li>
        </ul>
        <p>Each role has its own profile and tools designed to make collaboration easier.</p>
      </>
    ),
  },
  {
    question: "How is HighVibe different from other retreat marketplaces?",
    answer: (
      <>
        <p>Many platforms simply list retreats and rely on search. HighVibe focuses on connection and collaboration.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Guides can discover venues and local vendors.</li>
          <li>Hosts can connect with retreat leaders looking for the right space.</li>
          <li>Vendors can be introduced to retreats happening in their region.</li>
          <li>Seekers can find experiences aligned with their interests.</li>
        </ul>
        <p>The goal is not just listing retreats, but helping the right people come together to create them.</p>
      </>
    ),
  },
  {
    question: "How does the matching process work?",
    answer: (
      <>
        <p>Users create profiles describing what they offer or what they're looking for. From there, HighVibe uses filters, location, experience type, timing, and other signals to help surface aligned matches.</p>
        <p>Guides planning retreats can describe the type of experience they want to build and the destination they're considering. Seekers can share the type of retreat they're looking for. The platform helps surface relevant connections so conversations can begin.</p>
      </>
    ),
  },
  {
    question: "Does HighVibe only work with people already on the platform?",
    answer: (
      <p>No. One of HighVibe's goals is to expand opportunity within retreat destinations. When a retreat is being planned in a particular location, HighVibe may identify aligned local businesses and professionals in that region and invite them to join the ecosystem. This helps ensure retreat leaders have access to the right support while also directing opportunity toward local communities.</p>
    ),
  },
  {
    question: "Do I need to commit to anything when I create a profile?",
    answer: (
      <p>No. Creating a profile simply allows you to participate in the ecosystem and begin making connections. You choose when and how you engage with opportunities that arise.</p>
    ),
  },
  {
    question: "How do Seekers find retreats?",
    answer: (
      <p>Seekers can explore retreats based on location, timing, experience type, budget, and other preferences. They can also share what they're looking for and receive introductions to retreats that may fit.</p>
    ),
  },
  {
    question: "How do Guides plan a retreat through HighVibe?",
    answer: (
      <p>Guides can use HighVibe to discover retreat-ready venues, connect with vendors in their destination, and manage conversations with potential collaborators. The platform is designed to simplify the process of building a retreat by bringing key partners into one place.</p>
    ),
  },
  {
    question: "How do Hosts get bookings?",
    answer: (
      <p>Hosts list their space and provide details about capacity, setting, amenities, and retreat suitability. Guides planning retreats in that region can discover the property and begin conversations about hosting their retreat there.</p>
    ),
  },
  {
    question: "How do Vendors get connected with retreats?",
    answer: (
      <p>Vendors create profiles describing the services they offer and the regions they serve. When retreats are being planned in those areas, they may be introduced to Guides looking for the types of services they provide.</p>
    ),
  },
  {
    question: "How does HighVibe make money?",
    answer: (
      <>
        <p>HighVibe uses a combination of membership options and marketplace fees when bookings occur. These help support the platform, maintain the ecosystem, and continue developing tools that help retreats operate more smoothly.</p>
        <p>Specific pricing details are available within each role's account area.</p>
      </>
    ),
  },
  {
    question: "Are there hidden fees?",
    answer: (
      <p>No. Pricing is designed to be transparent. Any platform fees are clearly displayed before a booking or payment is completed.</p>
    ),
  },
  {
    question: "Does HighVibe handle payments?",
    answer: (
      <>
        <p>HighVibe may facilitate payments for certain bookings through integrated payment providers. In other cases, Guides, Hosts, and Vendors may coordinate payment terms directly with one another.</p>
        <p>Payment structures can vary depending on the type of retreat or service.</p>
      </>
    ),
  },
  {
    question: "Who is responsible for the retreat experience itself?",
    answer: (
      <>
        <p>HighVibe provides the platform that helps people connect and collaborate. The retreat experience itself is organized and delivered by the Guide hosting the retreat and the partners involved.</p>
        <p>Participants should review retreat details carefully and communicate directly with the retreat organizer before booking.</p>
      </>
    ),
  },
  {
    question: "What happens if something goes wrong with a retreat?",
    answer: (
      <>
        <p>Because retreats are independently organized experiences, Guides are responsible for the retreat they host. HighVibe encourages clear communication and transparency between all parties involved.</p>
        <p>If an issue arises, participants should first contact the retreat organizer directly. HighVibe may assist with communication where appropriate, but it is not the organizer of the retreat itself.</p>
      </>
    ),
  },
  {
    question: "How does HighVibe maintain trust and quality?",
    answer: (
      <>
        <p>Profiles include structured information designed to make expectations clear. As the platform grows, HighVibe will continue developing tools that support transparency, accountability, and professional standards within the ecosystem.</p>
        <p>Accounts that misrepresent services or violate platform standards may be removed.</p>
      </>
    ),
  },
  {
    question: "Is HighVibe available worldwide?",
    answer: (
      <p>Yes. Retreats can happen anywhere. HighVibe is designed to support experiences across different regions and cultures, while encouraging collaboration with local professionals and communities wherever retreats take place.</p>
    ),
  },
  {
    question: "How can I stay informed as the platform evolves?",
    answer: (
      <p>The platform is currently growing with an early group of members. As new features, partnerships, and opportunities are introduced, updates will be shared with members through the platform and email announcements.</p>
    ),
  },
  {
    question: "How do payments work on HighVibe Retreats?",
    answer: (
      <>
        <p>HighVibe facilitates payments through a secure third-party payment processor. When a booking or service is confirmed on the platform, payments may be processed directly through HighVibe so they can be securely transferred to the appropriate retreat organizer, host, or vendor.</p>
        <p>Using the platform for payments helps create a clear record of the transaction for everyone involved.</p>
      </>
    ),
  },
  {
    question: "When do retreat organizers, hosts, or vendors receive payment?",
    answer: (
      <>
        <p>Payment timing may vary depending on the type of booking and the agreements made between participants. In general, funds are released according to the payment schedule associated with the retreat or service.</p>
        <p>Details about payment timing will be visible before confirming a booking.</p>
      </>
    ),
  },
  {
    question: "What is HighVibe's platform fee?",
    answer: (
      <>
        <p>HighVibe may charge a platform fee on certain bookings completed through the site. These fees help support the technology, payment infrastructure, and ecosystem that make it easier for retreat leaders, hosts, vendors, and seekers to connect and collaborate.</p>
        <p>Any applicable fees are displayed clearly before payment is completed.</p>
      </>
    ),
  },
  {
    question: "What is the cancellation or refund policy?",
    answer: (
      <>
        <p>Cancellation and refund policies are determined by the retreat organizer or service provider and should be clearly stated before a booking is confirmed.</p>
        <p>HighVibe provides the platform where these bookings take place but does not control the individual policies set by retreat leaders or vendors.</p>
        <p>Participants should review cancellation terms carefully before making a payment.</p>
      </>
    ),
  },
  {
    question: "Does HighVibe hold responsibility for retreats or services booked through the platform?",
    answer: (
      <>
        <p>HighVibe provides the platform that connects participants but does not organize or operate the retreats themselves.</p>
        <p>Each retreat, service, or venue is independently managed by the Guide, Host, or Vendor offering it. They are responsible for the experience they provide.</p>
        <p>HighVibe encourages transparency and communication between participants but is not responsible for the operation of individual retreats or services.</p>
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-4xl">Support & FAQ</CardTitle>
            <CardDescription>
              Have a question? We're here to help. You can reach us by email at <a href="mailto:info@highviberetreats.com" className="text-primary hover:underline">info@highviberetreats.com</a> or by using our <Link href="/contact" className="text-primary hover:underline">contact form</Link>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-headline text-2xl mb-4">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent className="space-y-4 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
