'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Check, X, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildGuideProfileFromMonologue, type BuildGuideProfileOutput } from '@/ai/flows/build-guide-profile-flow';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function VoiceOnboardingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [processingState, setProcessingState] = useState<'idle' | 'listening' | 'processing' | 'reviewing' | 'saving'>('idle');
  const [extractedData, setExtractedData] = useState<BuildGuideProfileOutput | null>(null);
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Speech Recognition instance
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
          if (isRecording) { // If it stops unexpectedly, try to restart
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
      // Processing will start in the 'onend' handler
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
                const data = await buildGuideProfileFromMonologue({ monologue: transcript });
                setExtractedData(data);
                setProcessingState('reviewing');
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'AI Processing Failed', description: 'Could not extract profile data from your speech.' });
                setProcessingState('listening');
            }
        }
        processTranscript();
    }
  }, [processingState, transcript, toast]);
  
  const handleSaveChanges = async () => {
    if (!extractedData || user.status !== 'authenticated' || !firestore) return;
    setProcessingState('saving');
    
    const { displayName, headline, bio, guideRetreatTypes } = extractedData;
    const userRef = doc(firestore, 'users', user.data.uid);
    const profileSlug = (displayName || user.data.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
        await setDoc(userRef, {
            displayName,
            headline,
            bio,
            guideRetreatTypes,
            roles: ['guide'],
            primaryRole: 'guide',
            profileComplete: true,
            onboardingComplete: true,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            profileSlug: `${profileSlug}-${user.data.uid.substring(0, 4)}`,
            email: user.data.email,
        }, { merge: true });

        toast({ title: "Profile created!", description: "Welcome to HighVibe Retreats." });
        router.push('/guide');

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Failed to Save', description: 'Your profile could not be saved. Please try again.' });
        setProcessingState('reviewing');
    }
  };
  
  const handleDataChange = (field: keyof BuildGuideProfileOutput, value: string | string[]) => {
      if (extractedData) {
          setExtractedData({ ...extractedData, [field]: value });
      }
  }

  const renderContent = () => {
    switch (processingState) {
        case 'listening':
            return (
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Click the microphone to start. Tell us about yourself, what you do, the types of retreats you lead, and your unique style. The more detail, the better!</p>
                    <p className="text-sm text-muted-foreground p-4 bg-secondary rounded-md">Example: "Hi, my name is Maya. I'm a yoga instructor and sound healer based in Southern California. My headline is 'Guiding journeys back to the self'. I specialize in vinyasa yoga and restorative sound baths for wellness and personal growth retreats."</p>
                    {transcript && <p className="mt-4 p-2 bg-muted rounded-md text-left text-sm">{transcript}<span className="opacity-60">{interimTranscript}</span></p>}
                </div>
            );
        case 'processing':
            return (
                 <div className="text-center flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="font-bold">Analyzing your profile...</p>
                    <p className="text-sm text-muted-foreground">The AI is building your profile from your speech.</p>
                </div>
            );
        case 'reviewing':
        case 'saving':
            return (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Here’s what we heard. Review and edit, then save your profile.</p>
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
                        <Label>Retreat Types</Label>
                        <Textarea value={extractedData?.guideRetreatTypes.join(', ')} onChange={(e) => handleDataChange('guideRetreatTypes', e.target.value.split(',').map(s => s.trim()))} />
                        <p className="text-xs text-muted-foreground">Separated by commas</p>
                    </div>
                </div>
            );
        default:
            return (
                 <div className="text-center">
                    <p className="text-muted-foreground mb-4">Click the microphone to start. Tell us about yourself, what you do, the types of retreats you lead, and your unique style. The more detail, the better!</p>
                </div>
            );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl">Voice Onboarding</CardTitle>
            <CardDescription className="text-lg">
                Let's create your profile in seconds. Just speak, and our AI will do the rest.
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

// Add a declaration for webkitSpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}
