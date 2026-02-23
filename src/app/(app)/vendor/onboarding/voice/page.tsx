import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VendorVoiceOnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Voice Onboarding</CardTitle>
            <CardDescription>
              This is a placeholder for the Vendor voice-powered onboarding flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">Voice Onboarding Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              Soon, you'll be able to describe your services and have AI build your profile automatically. For now, please proceed to your dashboard.
            </p>
            <Button asChild size="lg">
                <Link href="/vendor">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
