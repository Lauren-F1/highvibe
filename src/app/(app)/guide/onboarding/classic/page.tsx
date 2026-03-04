'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/image-upload';
import { experienceTypes } from '@/lib/mock-data';

const retreatTypeOptions = experienceTypes.filter(t => t.value !== 'all-experiences').map(t => t.label);

export default function GuideClassicOnboardingPage() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Step 1
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');

  // Step 2
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Step 3
  const [avatarUrl, setAvatarUrl] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [locationLabel, setLocationLabel] = useState('');

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const canProceed = () => {
    if (step === 1) return displayName.trim().length >= 2 && bio.trim().length >= 20;
    if (step === 2) return selectedTypes.length > 0;
    return true;
  };

  const handleSave = async () => {
    if (user.status !== 'authenticated' || !firestore) return;
    setSaving(true);

    const profileSlug = (displayName || user.data.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      await setDoc(doc(firestore, 'users', user.data.uid), {
        displayName,
        headline,
        bio,
        guideRetreatTypes: selectedTypes,
        avatarUrl: avatarUrl[0] || '',
        galleryUrls,
        locationLabel,
        roles: ['guide'],
        primaryRole: 'guide',
        profileComplete: true,
        onboardingComplete: true,
        profileSlug: `${profileSlug}-${user.data.uid.substring(0, 4)}`,
        email: user.data.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({ title: "Profile created!", description: "Welcome to HighVibe Retreats." });
      router.push('/guide');
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to Save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <CardTitle className="font-headline text-3xl">
              {step === 1 && 'About You'}
              {step === 2 && 'Your Specialties'}
              {step === 3 && 'Photos & Location'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself so retreat seekers can find you.'}
              {step === 2 && 'What types of retreats do you lead?'}
              {step === 3 && 'Add a photo and your location to complete your profile.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name *</Label>
                  <Input id="displayName" placeholder="e.g., Maya Chen" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input id="headline" placeholder="e.g., Yoga Instructor & Sound Healer" value={headline} onChange={e => setHeadline(e.target.value)} maxLength={80} />
                  <p className="text-xs text-muted-foreground">{headline.length}/80 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself, your experience, and your approach to retreat leading..." rows={6} value={bio} onChange={e => setBio(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {retreatTypeOptions.map(type => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox checked={selectedTypes.includes(type)} onCheckedChange={() => toggleType(type)} />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <ImageUpload
                    value={avatarUrl}
                    onChange={(val) => setAvatarUrl(Array.isArray(val) ? val : [val])}
                    storagePath={`users/${user.status === 'authenticated' ? user.data.uid : 'temp'}/avatar`}
                    maxFiles={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gallery Photos (optional)</Label>
                  <ImageUpload
                    value={galleryUrls}
                    onChange={(val) => setGalleryUrls(Array.isArray(val) ? val : [val])}
                    storagePath={`users/${user.status === 'authenticated' ? user.data.uid : 'temp'}/gallery`}
                    multiple
                    maxFiles={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., Los Angeles, California" value={locationLabel} onChange={e => setLocationLabel(e.target.value)} />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Complete Profile
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
