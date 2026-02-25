import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Mic, FileText } from 'lucide-react';

export default function HostOnboardingChoicePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl">Hello HighVibe Host</CardTitle>
            <CardDescription className="text-lg">
              Let’s build your profile so the right guides and collaborators can find you. Choose how you’d like to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <Link href="/host/onboarding/voice" passHref>
                <Card className="h-full flex flex-col items-center justify-center text-center p-6 bg-primary/10 border-primary/20 hover:bg-primary/20 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
                    <Mic className="h-12 w-12 text-primary mb-4" />
                    <h3 className="font-bold text-lg">Voice Onboarding</h3>
                    <p className="text-sm text-muted-foreground">For those who prefer talking over typing. Say it out loud and we’ll turn it into a polished profile.</p>
                </Card>
            </Link>
             <Link href="/host/onboarding/classic" passHref>
                 <Card className="h-full flex flex-col items-center justify-center text-center p-6 bg-primary/10 border-primary/20 hover:bg-primary/20 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
                    <FileText className="h-12 w-12 text-primary mb-4" />
                    <h3 className="font-bold text-lg">Classic Onboarding</h3>
                    <p className="text-sm text-muted-foreground">For those who prefer the timeless route. A simple form you can fill out at your own pace.</p>
                </Card>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
