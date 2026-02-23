import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle as="h1" className="font-headline text-4xl">HighVibe Retreats – Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm font-body text-foreground/80">
            <p className="font-medium">Effective Date: February 1, 2026</p>
            <p>HighVibe Retreats (“HighVibe,” “we,” “us,” or “our”) respects your privacy and is committed to protecting your personal information.</p>
            <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services.</p>
            <p className="font-bold">If you do not agree with this policy, do not use the platform.</p>
            
            <div className="space-y-2">
              <h2 className="font-headline text-xl pt-4 font-bold">1. Information We Collect</h2>
              <p>We may collect the following categories of information:</p>
              
              <h3 className="font-semibold pt-2">A. Information You Provide Directly</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number (if provided)</li>
                <li>Account credentials</li>
                <li>Profile information</li>
                <li>Retreat listing details</li>
                <li>Payment-related information</li>
                <li>Communications with other users</li>
                <li>Waitlist submissions</li>
              </ul>
              
              <h3 className="font-semibold pt-2">B. Payment Information</h3>
              <p>Payments are processed through Stripe. HighVibe does not store full credit card numbers.</p>
              <p>Stripe collects and processes payment information according to its own privacy policy.</p>
              
              <h3 className="font-semibold pt-2">C. Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Usage data</li>
                <li>Pages visited</li>
                <li>Referring URLs</li>
                <li>Interaction timestamps</li>
              </ul>
              
              <h3 className="font-semibold pt-2">D. Cookies and Tracking Technologies</h3>
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Improve platform performance</li>
                <li>Analyze usage patterns</li>
                <li>Enable login functionality</li>
                <li>Track referral sources</li>
              </ul>
              <p>You may control cookies through your browser settings.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">2. How We Use Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Operate and maintain the platform</li>
                    <li>Process bookings and payments</li>
                    <li>Communicate with users</li>
                    <li>Provide customer support</li>
                    <li>Enforce our Terms and Agreements</li>
                    <li>Improve functionality and performance</li>
                    <li>Send transactional emails</li>
                    <li>Send marketing communications (where permitted)</li>
                    <li>Prevent fraud and abuse</li>
                </ul>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">3. How We Share Information</h2>
                <p>We may share information with:</p>
                
                <h3 className="font-semibold pt-2">A. Service Providers</h3>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Stripe (payment processing)</li>
                    <li>Cloud hosting providers (e.g., Firebase)</li>
                    <li>Email service providers</li>
                    <li>Analytics providers</li>
                </ul>
                
                <h3 className="font-semibold pt-2">B. Other Users</h3>
                <p>Certain profile and listing information is visible to other users.</p>
                
                <h3 className="font-semibold pt-2">C. Legal Requirements</h3>
                <p>We may disclose information if required by law, court order, or to protect rights and safety.</p>
                
                <h3 className="font-semibold pt-2">D. Business Transfers</h3>
                <p>If HighVibe is sold or merged, user information may transfer as part of the transaction.</p>
                
                <p className="font-medium">We do not sell personal information.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">4. Data Retention</h2>
                <p>We retain information as long as necessary to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Provide services</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes</li>
                    <li>Enforce agreements</li>
                </ul>
                <p>We may retain limited information after account deletion where legally required.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">5. Your Privacy Rights</h2>
                <p>Depending on your jurisdiction, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your data</li>
                    <li>Object to certain processing</li>
                    <li>Withdraw consent (where applicable)</li>
                </ul>
                <p>Nevada residents may request information about data sharing practices under Nevada law.</p>
                <p>California residents may have additional rights under the California Consumer Privacy Act (CCPA).</p>
                <p>To exercise rights, contact: <a href="mailto:privacy@highviberetreats.com" className="text-primary hover:underline">privacy@highviberetreats.com</a></p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">6. Data Security</h2>
                <p>We implement reasonable administrative, technical, and physical safeguards to protect personal information.</p>
                <p>However, no system is completely secure, and we cannot guarantee absolute security.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">7. International Users</h2>
                <p>If you access HighVibe from outside the United States, you understand that your information may be transferred to and processed in the United States.</p>
            </div>

             <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">8. Children’s Privacy</h2>
                <p>HighVibe is not intended for individuals under 18.</p>
                <p>We do not knowingly collect personal information from minors.</p>
                <p>If we learn that we have collected such information, we will delete it.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">9. Third-Party Links</h2>
                <p>The platform may contain links to third-party websites.</p>
                <p>We are not responsible for the privacy practices of third parties.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">10. Email Communications</h2>
                <p>We may send:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Transactional emails</li>
                    <li>Booking confirmations</li>
                    <li>Platform updates</li>
                    <li>Marketing emails (where permitted)</li>
                </ul>
                <p>You may unsubscribe from marketing communications at any time.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">11. Changes to This Policy</h2>
                <p>We may update this Privacy Policy at any time.</p>
                <p>Continued use of the platform constitutes acceptance of updates.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">12. Contact Information</h2>
                <p>For privacy inquiries, contact:</p>
                <p>
                    HighVibe Retreats<br />
                    Email: <a href="mailto:privacy@highviberetreats.com" className="text-primary hover:underline">privacy@highviberetreats.com</a><br />
                    State of Formation: Nevada, United States
                </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
