'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildHostProfileFromMonologue, type BuildHostProfileOutput } from '@/ai/flows/build-host-profile-flow';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function HostVoiceOnboardingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [processingState, setProcessingState] = useState<'idle' | 'listening' | 'processing' | 'reviewing' | 'saving'>('idle');
  const [extractedData, setExtractedData] = useState<BuildHostProfileOutput | null>(null);
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => setProcessingState('listening');
      rec.onend = () => {
        if (isRecording) {
          rec.start();
        } else {
          setProcessingState('processing');
        }
      };
      rec.onerror = (event) => {
        toast({ variant: 'destructive', title: 'Speech recognition error', description: event.error });
        setIsRecording(false);
        setProcessingState('idle');
      };
      rec.onresult = (event) => {
        let final = '';
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim);
        setTranscript(final);
      };
      setRecognition(rec);
    } else {
      toast({ variant: 'destructive', title: 'Browser not supported', description: 'Speech recognition is not available in your browser.' });
    }
  }, [toast, isRecording]);

  const toggleRecording = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognition.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    if (processingState === 'processing' && transcript) {
      async function processTranscript() {
        try {
          const data = await buildHostProfileFromMonologue({ monologue: transcript });
          setExtractedData(data);
          setProcessingState('reviewing');
        } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'AI Processing Failed', description: 'Could not extract profile data from your speech.' });
          setProcessingState('idle');
        }
      }
      processTranscript();
    }
  }, [processingState, transcript, toast]);

  const handleSaveChanges = async () => {
    if (!extractedData || user.status !== 'authenticated' || !firestore) return;
    setProcessingState('saving');

    const { displayName, headline, bio, hostVibe, hostAmenities, typicalCapacity } = extractedData;
    const userRef = doc(firestore, 'users', user.data.uid);
    const profileSlug = (displayName || user.data.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      await setDoc(userRef, {
        displayName,
        headline,
        bio,
        hostVibe,
        hostAmenities,
        typicalCapacity,
        roles: ['host'],
        primaryRole: 'host',
        profileComplete: true,
        onboardingComplete: true,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        profileSlug: `${profileSlug}-${user.data.uid.substring(0, 4)}`,
        email: user.data.email,
      }, { merge: true });

      toast({ title: "Profile created!", description: "Welcome to HighVibe Retreats." });
      router.push('/host/dashboard');
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to Save', description: 'Your profile could not be saved. Please try again.' });
      setProcessingState('reviewing');
    }
  };

  const handleDataChange = (field: keyof BuildHostProfileOutput, value: string | string[] | number) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, [field]: value });
    }
  };

  const renderContent = () => {
    switch (processingState) {
      case 'listening':
        return (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Click the microphone to start. Tell us about yourself, your property, the vibe, amenities, and how many guests you can host.</p>
            <p className="text-sm text-muted-foreground p-4 bg-secondary rounded-md">Example: &quot;Hi, I&apos;m Sarah. I own a private villa in Bali with 8 bedrooms that sleeps up to 16 guests. The vibe is luxury and tropical with a pool, yoga studio, and full kitchen. We&apos;re surrounded by rice terraces.&quot;</p>
            {transcript && <p className="mt-4 p-2 bg-muted rounded-md text-left text-sm">{transcript}<span className="opacity-60">{interimTranscript}</span></p>}
          </div>
        );
      case 'processing':
        return (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-bold">Analyzing your profile...</p>
            <p className="text-sm text-muted-foreground">The AI is building your host profile from your speech.</p>
          </div>
        );
      case 'reviewing':
      case 'saving':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Here&apos;s what we heard. Review and edit, then save your profile.</p>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Textarea value={extractedData?.displayName} onChange={(e) => handleDataChange('displayName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Textarea value={extractedData?.headline} onChange={(e) => handleDataChange('headline', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={extractedData?.bio} rows={5} onChange={(e) => handleDataChange('bio', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Property Vibe</Label>
              <Textarea value={extractedData?.hostVibe} onChange={(e) => handleDataChange('hostVibe', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <Textarea value={extractedData?.hostAmenities.join(', ')} onChange={(e) => handleDataChange('hostAmenities', e.target.value.split(',').map(s => s.trim()))} />
              <p className="text-xs text-muted-foreground">Separated by commas</p>
            </div>
            <div className="space-y-2">
              <Label>Guest Capacity</Label>
              <Input type="number" value={extractedData?.typicalCapacity} onChange={(e) => handleDataChange('typicalCapacity', parseInt(e.target.value) || 0)} />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Click the microphone to start. Tell us about yourself, your property, the vibe, amenities, and how many guests you can host.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl">Voice Onboarding</CardTitle>
            <CardDescription className="text-lg">
              Let&apos;s create your host profile in seconds. Just speak, and our AI will do the rest.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] flex items-center justify-center">
            {renderContent()}
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4">
            {processingState !== 'reviewing' && processingState !== 'saving' && (
              <Button onClick={toggleRecording} size="lg" className="rounded-full w-20 h-20">
                {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
            )}
            <div className="text-sm font-bold text-muted-foreground">
              {processingState === 'listening' ? 'Listening...' : processingState === 'idle' ? 'Tap to start' : ''}
            </div>

            {processingState === 'reviewing' && (
              <div className="w-full flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setProcessingState('idle')}>Start Over</Button>
                <Button onClick={handleSaveChanges}>Save Profile</Button>
              </div>
            )}
            {processingState === 'saving' && (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
