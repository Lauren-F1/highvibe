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
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of HighVibe Retreats, a DBA of New Mindset Foundation LLC (&quot;HighVibe,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the platform, you agree to be bound by these Terms.
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
                <p>By using the platform, you authorize HighVibe and Stripe to process payments on your behalf and deduct applicable fees.</p>

                <p className="font-semibold pt-2">6.1 Seeker Payments</p>
                <p>Seekers pay the listed retreat or service price at checkout. No additional fees are charged to Seekers by HighVibe.</p>

                <p className="font-semibold pt-2">6.2 Provider Fees</p>
                <p>Two fees are deducted from each booking payout to Providers:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>Platform Fee:</strong> A percentage of the booking total based on the Provider's subscription plan. Current rates are disclosed on the Billing page and in the Provider Agreement.</li>
                    <li><strong>Payment Processing Fee:</strong> Stripe's standard processing fee (currently 2.9% + $0.30 per transaction) is deducted from the Provider's payout. This fee is charged by Stripe, not by HighVibe.</li>
                </ul>
                <p>Platform fees and subscription fees are disclosed at the point of purchase. Platform fee rates are locked at the time payment is successfully processed.</p>

                <p className="font-semibold pt-2">6.3 Payouts and Withholding</p>
                <p>HighVibe may:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Deduct platform and processing fees from payouts</li>
                    <li>Withhold payouts in cases of suspected fraud or disputes</li>
                    <li>Offset chargebacks and associated fees against future payouts</li>
                </ul>
                <p>Providers are responsible for chargebacks related to their retreats or services.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">7. Cancellation, Refund, and Dispute Policy</h2>
                <p className="font-semibold">7.1 Standard Cancellation Policy</p>
                <p>Unless the Guide or Host specifies a more generous policy, the following default cancellation schedule applies to all bookings made through HighVibe:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>30 or more days before the retreat start date:</strong> Full refund minus a non-refundable booking deposit equal to 15% of the total booking amount.</li>
                    <li><strong>15–29 days before the retreat start date:</strong> 50% refund of the total booking amount.</li>
                    <li><strong>0–14 days before the retreat start date:</strong> No refund.</li>
                    <li><strong>No-show:</strong> No refund.</li>
                </ul>
                <p className="font-semibold pt-2">7.2 Provider-Initiated Cancellations</p>
                <p>If a Guide or Host cancels a retreat for any reason, the Seeker is entitled to a full refund of the amount paid.</p>
                <p className="font-semibold pt-2">7.3 Force Majeure</p>
                <p>If a retreat is cancelled due to events beyond reasonable control (natural disasters, pandemics, government travel restrictions, severe weather), HighVibe will offer affected Seekers a platform credit or the option to reschedule. Cash refunds are not guaranteed in force majeure situations.</p>
                <p className="font-semibold pt-2">7.4 Acknowledgment at Checkout</p>
                <p>By completing a booking, you acknowledge that you have read, understood, and agreed to this cancellation and refund policy. This acknowledgment is recorded and may be used as evidence in the event of a payment dispute.</p>
                <p className="font-semibold pt-2">7.5 Disputes and Chargebacks</p>
                <p>HighVibe encourages Seekers to contact us before initiating a chargeback with their payment provider. We will make reasonable efforts to resolve disputes directly.</p>
                <p>Filing a chargeback without first attempting to resolve the issue through HighVibe may result in:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Account suspension or termination</li>
                    <li>Ineligibility for future bookings</li>
                    <li>Forfeiture of any Manifest Credits</li>
                </ul>
                <p>Providers are responsible for chargebacks related to their retreats or services. HighVibe may offset chargeback losses against future provider payouts.</p>
                <p className="font-semibold pt-2">7.6 Refund Processing</p>
                <p>Approved refunds will be processed within 5–10 business days to the original payment method. Platform fees and payment processing fees are non-refundable.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">7a. Inquiry-Only Listings</h2>
                <p>Certain retreats on HighVibe may be designated as "Inquiry Only." These listings are displayed for discovery and informational purposes only. Payment for Inquiry-Only retreats is not processed through HighVibe and is arranged directly between the Seeker and the Provider.</p>
                <p>HighVibe makes no representations regarding the legality, safety, or suitability of any retreat experience, including Inquiry-Only listings. Seekers are solely responsible for:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Researching the legality of retreat activities in both their home jurisdiction and the retreat location</li>
                    <li>Evaluating the qualifications and reputation of the Provider</li>
                    <li>Understanding any health, legal, or travel risks associated with participation</li>
                </ul>
                <p>HighVibe's standard cancellation and refund policy (Section 7) does not apply to Inquiry-Only listings. Any refund or cancellation terms are between the Seeker and the Provider.</p>
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
