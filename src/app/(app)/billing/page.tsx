import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Your current plan and billing details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You are currently on the <strong>Pro Plan</strong>.</p>
            <p>Next billing date: July 30, 2024</p>
            <Button>Upgrade Plan</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
