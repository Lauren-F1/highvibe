'use client';
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Conversation, Message } from '@/lib/inbox-data';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationViewProps {
    conversation: Conversation;
    onSendMessage: (threadId: string, message: string) => void;
}

export function ConversationView({ conversation, onSendMessage }: ConversationViewProps) {
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(conversation.id, newMessage);
            setNewMessage('');
        }
    };
    
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-start gap-4 border-b p-6">
                 <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg">{conversation.name}</p>
                    <p className="text-sm text-muted-foreground">{conversation.retreat}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
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
                            "max-w-xs md:max-w-md rounded-lg p-3 text-sm",
                             message.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        )}>
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="p-4 border-t">
                <div className="flex w-full items-center space-x-2">
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
                    <Button onClick={handleSend} size="icon" className="h-12 w-12 shrink-0">
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
