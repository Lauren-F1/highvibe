
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-4xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base font-body text-foreground/80">
            <p>
              This is a placeholder for your Privacy Policy. In a real application, you would detail how you collect, use, and protect user data.
            </p>
            
            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Data Collection</h3>
                <p>We collect information you provide directly to us, such as when you create an account, join the waitlist, or fill out a form. This may include your name, email address, and any other information you choose to provide.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Data Usage</h3>
                <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of the service, as well as to communicate with you directly.</p>
            </div>

            <div className="space-y-2">
                <h3 className="font-headline text-2xl pt-4">Data Storage</h3>
                <p>Your information is stored securely using industry-standard practices. We take reasonable measures to protect your information from loss, theft, misuse, and unauthorized access.</p>
            </div>
            
            <p className="pt-8 text-sm text-muted-foreground">
              This policy is effective as of today's date.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
