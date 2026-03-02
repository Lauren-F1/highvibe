'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/lib/inbox-data';
import { Send, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateMessageSuggestions, type MessageSuggestionsInput } from '@/ai/flows/generate-message-suggestions';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { scanMessage, CIRCUMVENTION_WARNING, CONTACT_SHARING_NOTICE } from '@/lib/message-monitor';

interface ConversationViewProps {
    conversation: Conversation;
    onSendMessage: (threadId: string, message: string) => void;
}

export function ConversationView({ conversation, onSendMessage }: ConversationViewProps) {
    const [newMessage, setNewMessage] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const user = useUser();
    const { toast } = useToast();

    // Real-time scan of message as user types
    const scanResult = useMemo(() => scanMessage(newMessage), [newMessage]);

    const handleSend = () => {
        if (newMessage.trim()) {
            // If flagged, show a toast warning but still allow sending
            if (scanResult.isFlagged) {
                toast({
                    variant: 'destructive',
                    title: 'Payment Policy Reminder',
                    description: CIRCUMVENTION_WARNING,
                });
            }
            onSendMessage(conversation.id, newMessage);
            setNewMessage('');
            setSuggestions([]);
        }
    };
    
    const handleGetSuggestions = async () => {
        if (user.status !== 'authenticated' || !user.profile?.primaryRole) {
            toast({
                variant: 'destructive',
                title: 'Could not generate suggestions',
                description: 'Your primary role is not set.'
            });
            return;
        }

        setIsLoadingSuggestions(true);
        setSuggestions([]);

        try {
            const input: MessageSuggestionsInput = {
                conversationHistory: conversation.messages.slice(-10), // Send recent history
                userRole: user.profile.primaryRole,
                partnerRole: conversation.role,
                retreatContext: conversation.retreat,
            };
            const result = await generateMessageSuggestions(input);
            setSuggestions(result.suggestions);
        } catch (error) {
            console.error("Error generating message suggestions:", error);
            toast({
                variant: 'destructive',
                title: 'AI Assistant Error',
                description: 'Could not generate suggestions at this time.'
            });
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center gap-4 p-6 border-b">
                 <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">{conversation.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{conversation.retreat}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-3">
                {conversation.messages.map((message) => (
                    <div key={message.id} className={cn(
                        "flex items-end gap-2",
                        message.sender === 'me' ? 'justify-end' : 'justify-start'
                    )}>
                        {message.sender === 'them' && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={conversation.avatar} />
                                <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn(
                            "max-w-[65%] rounded-[14px] py-3 px-[14px] text-sm leading-relaxed text-foreground",
                             message.sender === 'me' 
                             ? 'bg-white border border-beige border-l-[3px]' 
                             : 'bg-secondary border border-input'
                        )}>
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="p-4 border-t flex flex-col items-start gap-2">
                {/* Circumvention warning banner */}
                {scanResult.isFlagged && (
                    <div className="w-full flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm">
                        <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-destructive">Payment Policy Violation</p>
                            <p className="text-muted-foreground">{CIRCUMVENTION_WARNING}</p>
                        </div>
                    </div>
                )}
                {scanResult.showWarning && !scanResult.isFlagged && (
                    <div className="w-full flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-50 p-3 text-sm">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-700">Friendly Reminder</p>
                            <p className="text-muted-foreground">{CONTACT_SHARING_NOTICE}</p>
                        </div>
                    </div>
                )}
                {isLoadingSuggestions && <p className="text-sm text-muted-foreground px-2">Generating ideas...</p>}
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                onClick={() => setNewMessage(suggestion)}
                                className="h-auto py-1.5 px-3 text-left"
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                )}
                
                <div className="flex w-full items-start space-x-2">
                    <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="min-h-[60px]"
                    />
                    <div className="flex flex-col gap-2">
                        <Button onClick={handleSend} size="icon" className="h-10 w-10 shrink-0">
                            <Send className="h-5 w-5" />
                            <span className="sr-only">Send</span>
                        </Button>
                        <Button onClick={handleGetSuggestions} size="icon" variant="ghost" className="h-10 w-10 shrink-0" disabled={isLoadingSuggestions}>
                            <Sparkles className="h-5 w-5" />
                            <span className="sr-only">Get AI Suggestions</span>
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
