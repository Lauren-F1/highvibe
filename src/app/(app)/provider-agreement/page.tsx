import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProviderAgreementPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle as="h1" className="font-headline text-4xl">HighVibe Retreats – Provider Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm font-body text-foreground/80">
            <p className="font-medium">Effective Date: February 1, 2026</p>
            <p>This Provider Agreement (“Agreement”) governs all users operating as a Guide, Host, or Vendor on HighVibe Retreats (“HighVibe,” “we,” “us,” or “our”).</p>
            <p className="font-bold">By registering or operating as a Guide, Host, or Vendor, you agree to be legally bound by this Agreement.</p>
            <p>If you do not agree, you may not list, publish, connect Stripe, accept bookings, or operate as a provider on the platform.</p>
            
            <div className="space-y-2">
              <h2 className="font-headline text-xl pt-4 font-bold">1. Independent Contractor Status</h2>
              <p>You acknowledge and agree that:</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>You are an independent contractor.</li>
                <li>You are not an employee, partner, joint venturer, or agent of HighVibe.</li>
                <li>HighVibe does not supervise, direct, or control your services.</li>
                <li>You may not represent yourself as acting on behalf of HighVibe.</li>
              </ul>
              <p>Nothing in this Agreement creates an employment, agency, franchise, or partnership relationship.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">2. No Agency or Partnership</h2>
                <p>Nothing in this Agreement creates any agency, partnership, employment, joint venture, or fiduciary relationship between HighVibe and any Provider.</p>
                <p>Providers operate independently and at their own risk.</p>
              </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">3. Platform Role</h2>
                <p>HighVibe is solely a technology marketplace that facilitates introductions and payment processing between independent parties.</p>
                <p>HighVibe does not:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Organize, design, or create retreats</li>
                    <li>Co-host events</li>
                    <li>Supervise activities</li>
                    <li>Control retreat content</li>
                    <li>Control pricing</li>
                    <li>Inspect properties</li>
                    <li>Verify safety standards</li>
                    <li>Act as an employer, joint venturer, or agent</li>
                    <li>Endorse or guarantee any provider</li>
                </ul>
                <p>HighVibe’s role is limited to providing digital tools for listings, messaging, and payment processing.</p>
                <p>All retreat planning, execution, and safety obligations remain solely with the Provider.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">4. Legal Compliance</h2>
                <p>You represent and warrant that:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>You are legally permitted to provide your services.</li>
                    <li>You comply with all local, state, national, and international laws.</li>
                    <li>You maintain all required licenses and permits.</li>
                    <li>Your listings are accurate and not misleading.</li>
                </ul>
                <p>You are solely responsible for regulatory compliance.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">5. Insurance (Strongly Recommended)</h2>
                <p>Providers are strongly encouraged to maintain commercial general liability insurance or other coverage appropriate to their retreat, property, or services.</p>
                <p>HighVibe does not require proof of insurance and does not verify coverage.</p>
                <p>Providers acknowledge that they are solely responsible for determining and obtaining appropriate insurance coverage for their activities.</p>
                <p>Failure to maintain insurance does not transfer any liability to HighVibe.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">6. Safety and Risk Management</h2>
                <p>You are solely responsible for:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Participant safety</li>
                    <li>Emergency planning</li>
                    <li>Medical preparedness</li>
                    <li>Property condition</li>
                    <li>Vendor conduct</li>
                    <li>Contract enforcement</li>
                    <li>Screening participants where appropriate</li>
                </ul>
                <p>HighVibe does not monitor, supervise, or guarantee safety.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">7. Listings and Representations</h2>
                <p>You agree that all information in your listings is accurate and not misleading.</p>
                <p>You may not:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Exaggerate qualifications</li>
                    <li>Misrepresent amenities</li>
                    <li>Use stolen content</li>
                    <li>Post false reviews</li>
                </ul>
                <p>HighVibe may remove listings at its sole discretion.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">8. Payments and Stripe Authorization</h2>
                <p>All bookings must be processed through HighVibe using Stripe.</p>
                <p>You authorize HighVibe to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Collect platform fees</li>
                    <li>Deduct Stripe processing fees</li>
                    <li>Withhold payouts during disputes</li>
                    <li>Offset chargebacks from future payouts</li>
                </ul>
                <p>You are solely responsible for:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Refund obligations</li>
                    <li>Chargebacks</li>
                    <li>Failed service delivery</li>
                </ul>
                <p>HighVibe is not liable for payment disputes between you and participants.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">9. Refund Responsibility</h2>
                <p>You are responsible for clearly stating and honoring your cancellation and refund policies.</p>
                <p>If you cancel a retreat or fail to deliver services, you are solely responsible for refunds and related damages.</p>
            </div>

             <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">10. No Circumvention</h2>
                <p>You may not solicit or accept off-platform payments from users introduced through HighVibe.</p>
                <p>If you attempt to circumvent platform payments, HighVibe may:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Suspend or terminate your account</li>
                    <li>Charge applicable platform fees</li>
                    <li>Withhold payouts</li>
                    <li>Pursue recovery of lost fees</li>
                </ul>
                <p>HighVibe uses automated monitoring tools to detect patterns consistent with commission circumvention, including but not limited to repeated connections without bookings or communications directing users off-platform.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">10a. Contact Information and Partner Privacy</h2>
                <p>Personal contact information (email addresses, phone numbers, social media accounts) of other users discovered through the HighVibe platform may not be used for any purpose outside of the platform.</p>
                <p>You agree that:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>All communications with partners introduced through HighVibe must be conducted through the platform's messaging system until a booking is confirmed.</li>
                    <li>You will not share, sell, or distribute the personal contact information of any user obtained through the platform.</li>
                    <li>Direct contact information will only be shared between parties after a confirmed booking, and solely for the purpose of fulfilling that booking.</li>
                </ul>
                <p>Violation of this policy may result in immediate account suspension.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">11. Indemnification</h2>
                <p>You agree to indemnify, defend, and hold harmless HighVibe, its officers, directors, employees, contractors, and affiliates from and against any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Your retreat or service</li>
                    <li>Your property</li>
                    <li>Personal injury or death</li>
                    <li>Property damage</li>
                    <li>Regulatory violations</li>
                    <li>Misrepresentation</li>
                    <li>Breach of this Agreement</li>
                </ul>
                <p>This indemnification obligation survives termination.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">12. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law:</p>
                <p>HighVibe shall not be liable for:</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Personal injury</li>
                    <li>Property damage</li>
                    <li>Lost profits</li>
                    <li>Business interruption</li>
                    <li>Indirect or consequential damages</li>
                </ul>
                <p>Total liability shall not exceed the greater of:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Fees paid to HighVibe in the preceding 12 months, or</li>
                    <li>$100 USD.</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">13. Termination</h2>
                <p>HighVibe may suspend or terminate your account for:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Policy violations</li>
                    <li>Fraud</li>
                    <li>Safety concerns</li>
                    <li>Chargeback abuse</li>
                    <li>Off-platform solicitation</li>
                    <li>Regulatory risk</li>
                </ul>
                <p>Termination does not waive outstanding payment obligations.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">14. Governing Law and Arbitration</h2>
                <p>This Agreement is governed by the laws of the State of Nevada, without regard to conflict of law principles.</p>
                <p>Any dispute shall be resolved through binding arbitration on an individual basis.</p>
                <p>You waive participation in class actions.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">15. Severability</h2>
                <p>If any provision is deemed unenforceable, the remaining provisions remain in full force and effect.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">16. Entire Agreement</h2>
                <p>This Agreement constitutes the entire agreement between you and HighVibe regarding provider participation and supersedes all prior understandings.</p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
