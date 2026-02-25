import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HostVoiceOnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Host Voice Onboarding</CardTitle>
            <CardDescription>
              Describe your space and have AI build your profile automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">Voice Onboarding Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              Soon, you'll be able to describe your space and have AI build your profile automatically. For now, please proceed to your dashboard.
            </p>
            <Button asChild size="lg">
                <Link href="/host/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
