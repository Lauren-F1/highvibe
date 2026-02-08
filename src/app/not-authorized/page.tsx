import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';

export default function NotAuthorizedPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-screen">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Not Authorized</CardTitle>
          <CardDescription>
            You do not have permission to view this page. If you believe this is an error, please contact an administrator.
            <br/><br/>
            <Link href="/" className="text-primary hover:underline">Return to Homepage</Link>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
