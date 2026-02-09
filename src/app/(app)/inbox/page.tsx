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
import { MoreHorizontal, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function ConversationListItem({ convo, isSelected, onSelect, onMarkAsUnread }: { convo: Conversation, isSelected: boolean, onSelect: (id: string) => void, onMarkAsUnread: (id: string) => void }) {
  return (
    <li
      id={`thread-${convo.id}`}
      className={cn(
        "p-4 hover:bg-accent cursor-pointer flex items-center gap-4 transition-colors",
        isSelected && 'bg-accent'
      )}
      onClick={() => onSelect(convo.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(convo.id) }}
      tabIndex={0}
      role="button"
      aria-current={isSelected}
    >
      <div className={cn("flex items-start gap-4 flex-grow")}>
        {convo.unread && <div className="h-2.5 w-2.5 rounded-full bg-beige shrink-0 mt-1.5"></div>}
        <div className={cn("flex items-start gap-4 flex-grow", convo.unread ? "" : "pl-[14px]")}>
          <Avatar className="h-12 w-12">
            <AvatarImage src={convo.avatar} />
            <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
              <p className={cn("font-bold", convo.unread ? 'text-foreground' : 'text-muted-foreground')}>{convo.name} <span className="text-xs font-normal text-muted-foreground ml-1 p-1 bg-secondary rounded-sm">{convo.role}</span></p>
              <p className="text-xs text-muted-foreground shrink-0">2h ago</p>
            </div>
            <p className={cn("text-sm font-bold truncate", convo.unread ? 'text-foreground' : 'text-muted-foreground')}>{convo.retreat}</p>
            <p className={cn("text-sm truncate", convo.unread ? "text-foreground font-medium" : "text-muted-foreground")}>{convo.lastMessage}</p>
          </div>
        </div>
      </div>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -my-2 -mr-2" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => {e.stopPropagation(); onMarkAsUnread(convo.id); }}>
            Mark as unread
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

export default function InboxPage() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { conversations, markAsRead, sendMessage, markAsUnread } = useInbox();
  
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  const displayedConversations = useMemo(() => {
    let filtered = [...conversations];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(convo =>
        convo.name.toLowerCase().includes(lowercasedTerm) ||
        convo.retreat.toLowerCase().includes(lowercasedTerm) ||
        convo.lastMessage.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(convo => convo.role.toLowerCase() === roleFilter);
    }
    
    if (sortOption === 'unread') {
      filtered.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));
    } else { // 'newest'
      // The default order is newest first as new messages are prepended in the context.
      // To be safe, we can sort by timestamp if available. For mock data, we rely on array order.
    }
    
    return filtered;
  }, [conversations, searchTerm, roleFilter, sortOption]);

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
    
    if (threadId && displayedConversations.some(c => c.id === threadId)) {
        if (selectedThreadId !== threadId) {
            setSelectedThreadId(threadId);
            markAsRead(threadId);
        }
    } else if (displayedConversations.length > 0) {
        const firstThreadId = displayedConversations[0].id;
        if (selectedThreadId !== firstThreadId) {
             router.replace(`/inbox?c=${firstThreadId}`, { scroll: false });
        }
    } else if (displayedConversations.length === 0) {
        if (selectedThreadId !== null) {
            setSelectedThreadId(null);
            if (searchParams.has('c')) {
                router.replace('/inbox', { scroll: false });
            }
        }
    }
  }, [user.status, searchParams, router, markAsRead, displayedConversations, selectedThreadId]);

  const handleSelectConversation = (id: string) => {
    if (selectedThreadId !== id) {
      markAsRead(id);
      router.push(`/inbox?c=${id}`, { scroll: false });
    }
  };
  
  const selectedConversation = useMemo(
    () => displayedConversations.find(c => c.id === selectedThreadId),
    [displayedConversations, selectedThreadId]
  );

  if (isFirebaseEnabled && (user.status === 'loading' || user.status === 'unauthenticated')) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">Inbox</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 h-[calc(100vh-250px)]">
            <div className="md:col-span-1 lg:col-span-1 border rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                     <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-[150px] flex-none">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="unread">Unread First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {displayedConversations.length > 0 ? (
                    <ul className="divide-y">
                        {displayedConversations.map((convo) => (
                            <ConversationListItem
                                key={convo.id}
                                convo={convo}
                                isSelected={selectedThreadId === convo.id}
                                onSelect={handleSelectConversation}
                                onMarkAsUnread={markAsUnread}
                            />
                        ))}
                    </ul>
                  ) : (
                    <div className="text-center p-8 text-sm text-muted-foreground">
                      No conversations found.
                    </div>
                  )}
                </div>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
                {selectedConversation ? (
                    <ConversationView conversation={selectedConversation} onSendMessage={sendMessage} />
                ) : (
                    <Card className="h-full flex items-center justify-center bg-secondary">
                        <div className="text-center">
                            <p className="text-muted-foreground">
                              {conversations.length > 0 ? 'Select a conversation to start messaging.' : 'You have no messages.'}
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    </div>
  );
}
