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
import { vendorCategories } from '@/lib/mock-data';

const categoryOptions = vendorCategories.map(c => c.name);

export default function VendorClassicOnboardingPage() {
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [offerings, setOfferings] = useState('');
  const [serviceRadiusMiles, setServiceRadiusMiles] = useState('50');

  // Step 3
  const [avatarUrl, setAvatarUrl] = useState<string[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [locationLabel, setLocationLabel] = useState('');
  const [vendorWebsite, setVendorWebsite] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const canProceed = () => {
    if (step === 1) return displayName.trim().length >= 2 && bio.trim().length >= 20;
    if (step === 2) return selectedCategories.length > 0;
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
        vendorCategories: selectedCategories,
        offerings: offerings.split(',').map(s => s.trim()).filter(Boolean),
        serviceRadiusMiles: parseInt(serviceRadiusMiles) || 50,
        avatarUrl: avatarUrl[0] || '',
        portfolioUrls,
        locationLabel,
        vendorWebsite,
        instagramUrl,
        roles: ['vendor'],
        primaryRole: 'vendor',
        profileComplete: true,
        onboardingComplete: true,
        profileSlug: `${profileSlug}-${user.data.uid.substring(0, 4)}`,
        email: user.data.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({ title: "Profile created!", description: "Welcome to HighVibe Retreats." });
      router.push('/vendor/dashboard');
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
              {step === 2 && 'Your Services'}
              {step === 3 && 'Photos & Links'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself so retreat guides can find you.'}
              {step === 2 && 'What services do you offer?'}
              {step === 3 && 'Add photos, your location, and any links.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name *</Label>
                  <Input id="displayName" placeholder="e.g., Alex Rivera" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input id="headline" placeholder="e.g., Sound Healer & Breathwork Facilitator" value={headline} onChange={e => setHeadline(e.target.value)} maxLength={80} />
                  <p className="text-xs text-muted-foreground">{headline.length}/80 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea id="bio" placeholder="Tell us about your services, experience, and what makes you unique..." rows={6} value={bio} onChange={e => setBio(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Service Categories *</Label>
                  <p className="text-xs text-muted-foreground mb-2">Select all that apply.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {categoryOptions.map(category => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox checked={selectedCategories.includes(category)} onCheckedChange={() => toggleCategory(category)} />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offerings">Specific Offerings</Label>
                  <Textarea id="offerings" placeholder="e.g., 90-min Sound Bath, Breathwork Workshop, Private Sessions" value={offerings} onChange={e => setOfferings(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Separated by commas</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius">Service Radius (miles)</Label>
                  <Input id="radius" type="number" min={1} placeholder="50" value={serviceRadiusMiles} onChange={e => setServiceRadiusMiles(e.target.value)} />
                  <p className="text-xs text-muted-foreground">How far are you willing to travel?</p>
                </div>
              </>
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
                  <Label>Portfolio Photos (optional)</Label>
                  <ImageUpload
                    value={portfolioUrls}
                    onChange={(val) => setPortfolioUrls(Array.isArray(val) ? val : [val])}
                    storagePath={`users/${user.status === 'authenticated' ? user.data.uid : 'temp'}/portfolio`}
                    multiple
                    maxFiles={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., Los Angeles, California" value={locationLabel} onChange={e => setLocationLabel(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input id="website" type="url" placeholder="https://..." value={vendorWebsite} onChange={e => setVendorWebsite(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram (optional)</Label>
                  <Input id="instagram" placeholder="https://instagram.com/..." value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} />
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
