import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>
              This is a placeholder page for customer support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>A support form or contact information will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
