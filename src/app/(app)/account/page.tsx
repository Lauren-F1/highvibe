import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              This is a placeholder page for your account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Account settings will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
