import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle as="h1" className="font-headline text-4xl">HighVibe Retreats – Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm font-body text-foreground/80">
            <p className="font-medium">Effective Date: February 1, 2026</p>
            <p>
              These Terms of Service (“Terms”) govern your access to and use of HighVibe Retreats (“HighVibe,” “we,” “us,” or “our”). By accessing or using the platform, you agree to be bound by these Terms.
            </p>
            <p className="font-bold">If you do not agree, you may not use the platform.</p>
            
            <div className="space-y-2">
              <h2 className="font-headline text-xl pt-4 font-bold">1. Eligibility</h2>
              <p>You must be at least 18 years old to use HighVibe.</p>
              <p>By using the platform, you represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>You are legally capable of entering binding contracts.</li>
                <li>All information you provide is accurate and complete.</li>
                <li>You will comply with all applicable laws and regulations.</li>
              </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">2. Description of the Platform</h2>
                <p>HighVibe Retreats is a technology marketplace that enables independent Seekers, Guides, Hosts, and Vendors to connect.</p>
                <p>HighVibe does not organize, design, manage, operate, or control retreats or corporate events.</p>
                <p>HighVibe does not act as a travel agency, event planner, employer, sponsor, or corporate services provider.</p>
                <p>All retreats and services are created and operated solely by independent Providers.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">3. No Control Over Events</h2>
                <p>HighVibe does not control or direct the content, structure, schedule, safety measures, or execution of any retreat.</p>
                <p>HighVibe makes no representations regarding the suitability of a retreat for corporate, professional, or employer-sponsored participation.</p>
                <p>Any company or organization booking through the platform does so independently and assumes full responsibility for its participation decisions.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">4. Role-Based Responsibilities</h2>
                <p>Guides, Hosts, and Vendors represent and warrant that:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>They are legally permitted to provide their services.</li>
                    <li>They comply with all local, state, national, and international laws.</li>
                    <li>They maintain all required licenses and permits.</li>
                    <li>They maintain appropriate commercial general liability insurance.</li>
                    <li>Their listings are accurate and not misleading.</li>
                </ul>
                <p>Providers are solely responsible for:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Safety</li>
                    <li>Execution</li>
                    <li>Insurance</li>
                    <li>Contracts</li>
                    <li>Refund policies</li>
                    <li>Legal compliance</li>
                </ul>
                <p>HighVibe does not inspect properties or verify insurance unless explicitly stated.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">5. Listings and Content</h2>
                <p>Users are responsible for the accuracy and legality of their listings.</p>
                <p>By posting content, you grant HighVibe a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content for platform operation and marketing.</p>
                <p>You represent that you own or have the necessary rights to all content submitted.</p>
                <p>HighVibe may remove content at its sole discretion.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">6. Payments and Fees</h2>
                <p>All bookings and payments must be processed through HighVibe using Stripe.</p>
                <p>By using the platform, you authorize HighVibe and Stripe to process payments on your behalf and deduct applicable platform and processing fees.</p>
                <p>Platform fees and subscription fees are disclosed at the point of purchase.</p>
                <p>Stripe processing fees are paid by the applicable provider.</p>
                <p>HighVibe may:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Deduct fees from payouts</li>
                    <li>Withhold payouts in cases of suspected fraud or disputes</li>
                    <li>Offset chargebacks against future payouts</li>
                </ul>
                <p>Providers are responsible for chargebacks related to their retreats or services.</p>
                <p>Platform fee rates are locked at the time payment is successfully processed.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">7. Refunds and Disputes</h2>
                <p>Refund policies are determined by the Guide or Host unless otherwise specified.</p>
                <p>HighVibe does not guarantee refunds.</p>
                <p>We may facilitate communication between parties but are not obligated to resolve disputes in favor of either party.</p>
                <p>Chargebacks may result in account suspension.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">8. Manifest Credit and Promotions</h2>
                <p>Manifest Credit is a promotional incentive.</p>
                <p>Eligible Seekers may receive a credit equal to 3% of a completed retreat booking subtotal, capped at $500.</p>
                <p>Credits:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Are non-transferable</li>
                    <li>Have no cash value</li>
                    <li>Must be used within 12 months</li>
                    <li>May be revoked in cases of fraud or abuse</li>
                </ul>
                <p>Credits do not constitute stored monetary value.</p>
                <p>HighVibe may modify or discontinue promotional programs at any time.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">9. Prohibited Conduct</h2>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Misrepresent identity or qualifications</li>
                    <li>Engage in illegal activity</li>
                    <li>Harass or discriminate</li>
                    <li>Circumvent platform payments</li>
                    <li>Solicit off-platform transactions</li>
                    <li>Upload fraudulent listings</li>
                    <li>Interfere with platform integrity</li>
                </ul>
                <p>Off-platform payment solicitation may result in suspension and applicable fee recovery.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">10. Suspension and Termination</h2>
                <p>HighVibe may suspend or terminate accounts at its sole discretion for:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Violations of these Terms</li>
                    <li>Fraud or misrepresentation</li>
                    <li>Safety concerns</li>
                    <li>Chargeback abuse</li>
                    <li>Off-platform payment attempts</li>
                </ul>
                <p>We may remove listings without notice.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">11. Assumption of Risk</h2>
                <p>Participation in retreats involves inherent risks including, but not limited to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Physical activity</li>
                    <li>Travel</li>
                    <li>Transportation</li>
                    <li>Outdoor exposure</li>
                    <li>Food services</li>
                    <li>Wellness practices</li>
                    <li>Interaction with third parties</li>
                </ul>
                <p>By participating, you voluntarily assume all risks.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">12. Release of Liability</h2>
                <p>To the fullest extent permitted by law, you release HighVibe Retreats and its officers, directors, employees, contractors, and affiliates from all claims arising from:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Retreat participation</li>
                  <li>Property use</li>
                  <li>Vendor services</li>
                  <li>Travel disruptions</li>
                  <li>Personal injury</li>
                  <li>Property damage</li>
                  <li>Dissatisfaction with services</li>
                </ul>
                <p>HighVibe is not liable for acts or omissions of Guides, Hosts, Vendors, or Seekers.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">13. Indemnification</h2>
                <p>You agree to indemnify and hold harmless HighVibe from any claims, damages, losses, liabilities, or expenses arising out of:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Your listings</li>
                    <li>Your services</li>
                    <li>Your conduct</li>
                    <li>Your breach of these Terms</li>
                    <li>Injury or property damage connected to your retreat or property</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">14. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, HighVibe’s total liability shall not exceed the greater of:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>The total fees paid to HighVibe in the 12 months preceding the claim, or</li>
                  <li>$100 USD</li>
                </ul>
                <p>HighVibe shall not be liable for:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Indirect damages</li>
                    <li>Consequential damages</li>
                    <li>Lost profits</li>
                    <li>Emotional distress</li>
                    <li>Business interruption</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">15. No Guarantee</h2>
                <p>HighVibe does not guarantee:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Bookings</li>
                    <li>Income</li>
                    <li>Attendance</li>
                    <li>Match quality</li>
                    <li>Retreat outcomes</li>
                </ul>
                <p>Alignment and participation remain the responsibility of users.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">16. Force Majeure</h2>
                <p>HighVibe is not liable for delays or failures caused by events beyond reasonable control, including:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Natural disasters</li>
                    <li>Pandemics</li>
                    <li>Government restrictions</li>
                    <li>Weather events</li>
                    <li>Infrastructure failures</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">17. Electronic Communications</h2>
                <p>By using HighVibe, you consent to receive communications electronically.</p>
                <p>Electronic communication satisfies legal notice requirements.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">18. Dispute Resolution and Arbitration</h2>
                <p>These Terms are governed by the laws of the State of Nevada, without regard to conflict of law principles.</p>
                <p>Any dispute shall be resolved through binding arbitration on an individual basis.</p>
                <p>You waive the right to participate in class actions.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">19. Severability</h2>
                <p>If any provision of these Terms is found unenforceable, the remaining provisions shall remain in full force and effect.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">20. Entire Agreement</h2>
                <p>These Terms constitute the entire agreement between you and HighVibe regarding use of the platform and supersede all prior agreements or understandings.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">21. Updates</h2>
                <p>HighVibe may update these Terms at any time.</p>
                <p>Continued use of the platform constitutes acceptance of the updated Terms.</p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
