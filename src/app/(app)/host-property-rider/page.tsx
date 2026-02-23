
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function HostPropertyRiderPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle as="h1" className="font-headline text-4xl">HighVibe Retreats – Host Property Risk Rider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm font-body text-foreground/80">
            <p className="font-medium">Effective Date: February 1, 2026</p>
            <p>This Rider applies to all Hosts listing property on HighVibe.</p>
            
            <div className="space-y-2">
              <h2 className="font-headline text-xl pt-4 font-bold">1. Premises Responsibility</h2>
              <p>You are solely responsible for the safety, structural integrity, maintenance, and compliance of your property.</p>
              <p>HighVibe does not inspect, certify, or guarantee the safety of any property.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">2. Code Compliance</h2>
                <p>You represent that your property complies with:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Local building codes</li>
                    <li>Fire safety regulations</li>
                    <li>Occupancy limits</li>
                    <li>Zoning laws</li>
                    <li>Short-term rental regulations</li>
                </ul>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">3. Hazard Disclosure</h2>
                <p>You agree to disclose known hazards, including but not limited to:</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Pools</li>
                    <li>Saunas</li>
                    <li>Stairs</li>
                    <li>Remote locations</li>
                    <li>Wildlife exposure</li>
                    <li>Water features</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">4. Insurance</h2>
                <p>You maintain adequate property and liability insurance covering retreat use.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-xl pt-4 font-bold">5. Indemnification</h2>
                <p>You agree to indemnify HighVibe for claims arising from property-related injury, structural defects, or safety violations.</p>
                <p><strong>Governing Law:</strong> Nevada</p>
                <p><strong>Arbitration:</strong> Individual binding arbitration only.</p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
