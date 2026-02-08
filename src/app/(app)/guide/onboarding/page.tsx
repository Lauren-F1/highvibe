import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GuideOnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Guide!</CardTitle>
            <CardDescription>
              Let's set up your profile so you can start creating retreats and connecting with partners.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">Onboarding Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              This is a placeholder for the Guide onboarding flow. For now, you can proceed to your dashboard.
            </p>
            <Button asChild size="lg">
                <Link href="/guide">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
