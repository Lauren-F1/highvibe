'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/firebase";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { isFirebaseEnabled } from "@/firebase/config";
import { DevModeBanner } from "@/components/dev-mode-banner";

const conversations = [
  { id: 'conv1', name: 'Asha Sharma', role: 'Guide', retreat: 'The Glass House Inquiry', lastMessage: 'This looks like a great fit! Can you confirm availability for November?', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', unread: true },
  { id: 'conv2', name: 'Local Caterers', role: 'Vendor', retreat: 'The Glass House Inquiry', lastMessage: 'Yes, we can provide a sample menu for 25 guests.', avatar: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=200', unread: true },
  { id: 'conv3', name: 'Ubud Jungle Haven', role: 'Host', retreat: 'Sunrise Yoga in Bali', lastMessage: 'We have availability. Let\'s discuss details.', avatar: 'https://images.unsplash.com/photo-1600585154340-be6164a83639?w=200', unread: false },
];

export default function InboxPage() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseEnabled) {
      if (user.status === 'loading') {
        return;
      }
      if (user.status === 'unauthenticated') {
        const currentPath = `/inbox?${searchParams.toString()}`;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
    }

    const threadId = searchParams.get('c');
    if (threadId) {
      setSelectedThreadId(threadId);
      setTimeout(() => {
        const element = document.getElementById(`thread-${threadId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [user.status, searchParams, router]);

  if (isFirebaseEnabled && (user.status === 'loading' || user.status === 'unauthenticated')) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <>
      {!isFirebaseEnabled && <DevModeBanner />}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">Inbox</h1>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {conversations.map((convo) => (
                  <li 
                    key={convo.id}
                    id={`thread-${convo.id}`}
                    className={cn(
                      "p-4 hover:bg-accent cursor-pointer flex items-center gap-4 transition-colors",
                      selectedThreadId === convo.id && 'bg-accent'
                    )}
                     onClick={() => router.push(`/inbox?c=${convo.id}`)}
                  >
                      {convo.unread && <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0"></div>}
                    <div className="flex items-start gap-4 flex-grow">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={convo.avatar} />
                        <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-bold">{convo.name} <span className="text-xs font-normal text-muted-foreground ml-1 p-1 bg-secondary rounded-sm">{convo.role}</span></p>
                          <p className="text-xs text-muted-foreground">2h ago</p>
                        </div>
                        <p className="text-sm text-muted-foreground font-bold">{convo.retreat}</p>
                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
