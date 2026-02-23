import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mic, FileText } from 'lucide-react';

export default function HostOnboardingChoicePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl">Welcome, Host</CardTitle>
            <CardDescription className="text-lg">
              Let's create your profile so you can list your space and connect with the right guides.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <Link href="/host/onboarding/voice" passHref>
                <Card className="h-full flex flex-col items-center justify-center text-center p-6 hover:bg-accent transition-colors cursor-pointer">
                    <Mic className="h-12 w-12 text-primary mb-4" />
                    <h3 className="font-bold text-lg">Voice Onboarding</h3>
                    <p className="text-sm text-muted-foreground">Prefer talking over typing? Speak your profile into existence and let our AI handle the details.</p>
                </Card>
            </Link>
             <Link href="/host/onboarding/classic" passHref>
                 <Card className="h-full flex flex-col items-center justify-center text-center p-6 hover:bg-accent transition-colors cursor-pointer">
                    <FileText className="h-12 w-12 text-primary mb-4" />
                    <h3 className="font-bold text-lg">Classic Onboarding</h3>
                    <p className="text-sm text-muted-foreground">For the traditionalists. Fill out a simple form to build your profile at your own pace.</p>
                </Card>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
