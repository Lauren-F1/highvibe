'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/firebase";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { isFirebaseEnabled } from "@/firebase/config";
import { useInbox } from "@/context/InboxContext";
import { ConversationView } from "@/components/conversation-view";
import { Conversation } from "@/lib/inbox-data";

function ConversationListItem({ convo, isSelected, onSelect }: { convo: Conversation, isSelected: boolean, onSelect: (id: string) => void }) {
  return (
    <li
      id={`thread-${convo.id}`}
      className={cn(
        "p-4 hover:bg-accent cursor-pointer flex items-start gap-4 transition-colors",
        isSelected && 'bg-accent'
      )}
      onClick={() => onSelect(convo.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(convo.id) }}
      tabIndex={0}
      role="button"
      aria-current={isSelected}
    >
      {convo.unread && <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5"></div>}
      <div className={cn("flex items-start gap-4 flex-grow", convo.unread ? "" : "pl-[14px]")}>
        <Avatar className="h-12 w-12">
          <AvatarImage src={convo.avatar} />
          <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="font-bold">{convo.name} <span className="text-xs font-normal text-muted-foreground ml-1 p-1 bg-secondary rounded-sm">{convo.role}</span></p>
            <p className="text-xs text-muted-foreground shrink-0">2h ago</p>
          </div>
          <p className="text-sm text-muted-foreground font-bold truncate">{convo.retreat}</p>
          <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
        </div>
      </div>
    </li>
  );
}

export default function InboxPage() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { conversations, markAsRead, sendMessage } = useInbox();
  
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseEnabled) {
      if (user.status === 'loading') return;
      if (user.status === 'unauthenticated') {
        const currentPath = `/inbox?${searchParams.toString()}`;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
    }

    const threadId = searchParams.get('c');
    if (threadId && conversations.some(c => c.id === threadId)) {
      setSelectedThreadId(threadId);
      markAsRead(threadId);
    } else if (conversations.length > 0) {
        // If no valid thread is selected, select the first one.
        const firstThreadId = conversations[0].id;
        if (firstThreadId !== selectedThreadId) {
            router.replace(`/inbox?c=${firstThreadId}`, { scroll: false });
        }
    }
  }, [user.status, searchParams, router, conversations, markAsRead, selectedThreadId]);

  const handleSelectConversation = (id: string) => {
    markAsRead(id);
    // Update URL without a full page reload
    router.push(`/inbox?c=${id}`, { scroll: false });
  };
  
  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedThreadId),
    [conversations, selectedThreadId]
  );

  if (isFirebaseEnabled && (user.status === 'loading' || user.status === 'unauthenticated')) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">Inbox</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 h-[calc(100vh-250px)]">
            <div className="md:col-span-1 lg:col-span-1 border rounded-lg overflow-hidden">
                <Card className="h-full shadow-none rounded-none border-none">
                    <CardContent className="p-0 h-full overflow-y-auto">
                        <ul className="divide-y">
                            {conversations.map((convo) => (
                                <ConversationListItem
                                    key={convo.id}
                                    convo={convo}
                                    isSelected={selectedThreadId === convo.id}
                                    onSelect={handleSelectConversation}
                                />
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
                {selectedConversation ? (
                    <ConversationView conversation={selectedConversation} onSendMessage={sendMessage} />
                ) : (
                    <Card className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-muted-foreground">Select a conversation to view messages.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    </div>
  );
}