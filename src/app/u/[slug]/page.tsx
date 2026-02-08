'use client';
import { useState, useEffect } from 'react';
import { useUser, UserProfile } from '@/firebase/auth/use-user';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { notFound, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

async function getProfileBySlug(db: any, slug: string): Promise<UserProfile | null> {
  if (!db) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('profileSlug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }
  const userDoc = querySnapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
}

export default function PublicProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const currentUser = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      const profileData = await getProfileBySlug(firestore, slug);
      setProfile(profileData);
      setIsLoading(false);
    }
    if (firestore) {
      fetchProfile();
    }
  }, [firestore, slug]);
  
  const handleRequestConnection = async () => {
    if (currentUser.status !== 'authenticated' || !profile) {
      router.push(`/login?redirect=/u/${slug}`);
      return;
    }
    
    if (currentUser.data.uid === profile.uid) {
        toast({ title: "This is your own profile!", variant: "default" });
        return;
    }

    setIsConnecting(true);

    try {
      // Check if conversation already exists
      const conversationsRef = collection(firestore, 'conversations');
      const q = query(conversationsRef, where('participants', 'array-contains', currentUser.data.uid), limit(10));
      const querySnapshot = await getDocs(q);
      
      let existingConversationId: string | null = null;
      querySnapshot.forEach(doc => {
          const data = doc.data();
          if(data.participants.includes(profile.uid)) {
              existingConversationId = doc.id;
          }
      });
      
      if (existingConversationId) {
          router.push(`/inbox?c=${existingConversationId}`);
          return;
      }

      // Create new conversation
      const newConversationRef = await addDoc(collection(firestore, 'conversations'), {
        participants: [currentUser.data.uid, profile.uid],
        participantInfo: {
          [currentUser.data.uid]: {
            displayName: currentUser.profile?.displayName,
            avatarUrl: currentUser.profile?.avatarUrl,
          },
          [profile.uid as string]: {
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
          }
        },
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessageSnippet: 'Connection requested...',
      });
      
      // Add initial message
      await addDoc(collection(newConversationRef, 'messages'), {
          senderId: currentUser.data.uid,
          text: `Hi ${profile.displayName}, I found your profile on RETREAT and I’d like to connect.`,
          createdAt: serverTimestamp(),
      });
      
      router.push(`/inbox?c=${newConversationRef.id}`);

    } catch (error) {
      console.error("Error requesting connection:", error);
      toast({ title: "Could not start connection", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsConnecting(false);
    }
  };


  if (isLoading) {
    return <div className="container mx-auto px-4 py-12">Loading profile...</div>;
  }

  if (!profile) {
    notFound();
  }

  const { 
    displayName, 
    headline, 
    bio, 
    roles, 
    locationLabel, 
    isWillingToTravel, 
    travelRadiusMiles, 
    avatarUrl, 
    galleryUrls,
    vendorCategories,
    vendorWebsite,
    instagramUrl,
    offerings,
    portfolioUrls,
    hostAmenities,
    hostVibe,
    propertyShowcaseUrls,
    typicalCapacity,
  } = profile;

  const userInitial = displayName?.charAt(0) || 'U';

  const isOwnProfile = currentUser.status === 'authenticated' && currentUser.data.uid === profile.uid;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 shrink-0 border-2">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                    <CardTitle className="font-headline text-4xl">{displayName}</CardTitle>
                    {headline && <p className="text-lg text-muted-foreground mt-1">{headline}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {roles?.map(role => (
                            <Badge key={role} variant="secondary" className="capitalize">{role}</Badge>
                        ))}
                    </div>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                {locationLabel && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{locationLabel}</span>
                  </div>
                )}
                {isWillingToTravel && (
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    <span>
                      {travelRadiusMiles && travelRadiusMiles > 0
                        ? `Willing to travel up to ${travelRadiusMiles} miles`
                        : 'Willing to travel'}
                    </span>
                  </div>
                )}
                {vendorWebsite && (
                  <a href={vendorWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    <span>Website</span>
                  </a>
                )}
                 {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary">
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    <span>Instagram</span>
                  </a>
                )}
            </div>
            
            {bio && (
                <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="whitespace-pre-wrap">{bio}</p>
                </div>
            )}
            
            {galleryUrls && galleryUrls.length > 0 && (
              <div>
                  <h3 className="font-semibold mb-2">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                               <Image src={url} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
                          </div>
                      ))}
                  </div>
              </div>
            )}
             {/* Vendor Section */}
            {roles?.includes('vendor') && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Vendor Details</h3>
                {vendorCategories && vendorCategories.length > 0 && <div><h4 className="font-medium mb-2">Categories</h4><div className="flex flex-wrap gap-2">{vendorCategories.map(cat => <Badge key={cat} variant="outline">{cat}</Badge>)}</div></div>}
                {offerings && offerings.length > 0 && <div><h4 className="font-medium mb-2">Offerings</h4><p>{offerings.join(', ')}</p></div>}
                {portfolioUrls && portfolioUrls.length > 0 && (
                  <div>
                      <h4 className="font-medium mb-2">Portfolio</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {portfolioUrls.map((url, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                  <Image src={url} alt={`Portfolio image ${index + 1}`} fill className="object-cover" />
                              </div>
                          ))}
                      </div>
                  </div>
                )}
              </div>
            )}

             {/* Host Section */}
            {roles?.includes('host') && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Host Details</h3>
                {typicalCapacity && <div><h4 className="font-medium mb-2">Typical Capacity</h4><p>{typicalCapacity} guests</p></div>}
                {hostVibe && <div><h4 className="font-medium mb-2">Vibe</h4><p>{hostVibe}</p></div>}
                {hostAmenities && hostAmenities.length > 0 && <div><h4 className="font-medium mb-2">Amenities</h4><p>{hostAmenities.join(', ')}</p></div>}
                {propertyShowcaseUrls && propertyShowcaseUrls.length > 0 && (
                  <div>
                      <h4 className="font-medium mb-2">Property Showcase</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {propertyShowcaseUrls.map((url, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                  <Image src={url} alt={`Property image ${index + 1}`} fill className="object-cover" />
                              </div>
                          ))}
                      </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            {isOwnProfile ? (
              <Button asChild><Link href="/account/edit">Edit Profile</Link></Button>
            ) : (
              <Button onClick={handleRequestConnection} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Request to Connect'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
