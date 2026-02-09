'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/firebase";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { isFirebaseEnabled } from "@/firebase/config";
import { useInbox } from "@/context/InboxContext";

export default function InboxPage() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { conversations, markAsRead } = useInbox();
  
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

  const handleSelectConversation = (id: string) => {
    markAsRead(id);
    router.push(`/inbox?c=${id}`);
  };

  if (isFirebaseEnabled && (user.status === 'loading' || user.status === 'unauthenticated')) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <>
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
                     onClick={() => handleSelectConversation(convo.id)}
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
