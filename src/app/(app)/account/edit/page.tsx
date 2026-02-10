'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditProfilePage() {
  const user = useUser();
  const router = useRouter();

  if (user.status === 'loading') {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (user.status === 'unauthenticated' || !user.profile) {
    router.push('/login?redirect=/account/edit');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Card className="border-input">
          <CardHeader>
            <CardTitle className="text-beige-dark">Edit Profile</CardTitle>
            <CardDescription className="leading-relaxed">
              This information will be visible on your public profile. Keep it up to date to attract the right connections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm userProfile={user.profile} userId={user.data.uid} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
