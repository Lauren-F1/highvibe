import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function PayoutsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
            <CardDescription>
              This is a placeholder page for managing your payouts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Payout settings and history will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
