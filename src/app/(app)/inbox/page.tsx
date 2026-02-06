import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const conversations = [
  { id: 1, name: 'Elena Ray', role: 'Vendor', retreat: 'Sunrise Yoga in Bali', lastMessage: 'Sounds great! I can do that for $500.', avatar: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200', unread: true },
  { id: 2, name: 'The Glass House', role: 'Host', retreat: 'Andes Hiking Adventure', lastMessage: 'Yes, we are available for those dates. Let\'s connect.', avatar: 'https://images.unsplash.com/photo-1600585154340-be6164a83639?w=200', unread: false },
  { id: 3, name: 'Sam Kolder', role: 'Vendor', retreat: 'Sunrise Yoga in Bali', lastMessage: 'Perfect, I will send over the contract shortly.', avatar: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200', unread: false },

];

export default function InboxPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">Inbox</h1>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {conversations.map((convo) => (
                <li key={convo.id} className="p-4 hover:bg-accent cursor-pointer flex items-center gap-4">
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
  );
}
