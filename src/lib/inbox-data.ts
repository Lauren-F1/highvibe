export type Message = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
};

export type Conversation = {
  id: string;
  name: string;
  role: string;
  retreat: string;
  lastMessage: string;
  avatar: string;
  unread: boolean;
  messages: Message[];
};

// This is placeholder data. In a real application, this would come from a database.
export const mockConversations: Conversation[] = [
  { 
    id: 'conv1', 
    name: 'Asha Sharma', 
    role: 'Guide', 
    retreat: 'The Glass House Inquiry', 
    lastMessage: 'This looks like a great fit! Can you confirm availability for November?', 
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', 
    unread: true,
    messages: [
      { id: 'm1-1', sender: 'them', text: 'Hi! I saw your space "The Glass House" and I\'m very interested in booking it for a leadership retreat in November. Do you have any availability?', timestamp: '2024-07-30T10:00:00Z' },
      { id: 'm1-2', sender: 'me', text: 'Hello Asha, thanks for reaching out! The Glass House is a wonderful choice for leadership retreats. We do have some availability in November. What are your preferred dates?', timestamp: '2024-07-30T10:05:00Z' },
      { id: 'm1-3', sender: 'them', text: 'This looks like a great fit! Can you confirm availability for November?', timestamp: '2024-07-30T10:10:00Z' }
    ]
  },
  { 
    id: 'conv2', 
    name: 'Local Caterers', 
    role: 'Vendor', 
    retreat: 'The Glass House Inquiry', 
    lastMessage: 'Yes, we can provide a sample menu for 25 guests.', 
    avatar: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=200', 
    unread: true,
    messages: [
       { id: 'm2-1', sender: 'me', text: 'I\'m looking for catering for a retreat at The Glass House for 25 people. Are you available in November?', timestamp: '2024-07-29T14:00:00Z' },
       { id: 'm2-2', sender: 'them', text: 'Yes, we can provide a sample menu for 25 guests.', timestamp: '2024-07-29T14:05:00Z' },
    ]
  },
  { 
    id: 'conv3', 
    name: 'Ubud Jungle Haven', 
    role: 'Host', 
    retreat: 'Sunrise Yoga in Bali', 
    lastMessage: 'We have availability. Let\'s discuss details.', 
    avatar: 'https://images.unsplash.com/photo-1600585154340-be6164a83639?w=200', 
    unread: false,
    messages: [
      { id: 'm3-1', sender: 'me', text: 'Interested in booking your beautiful space for a yoga retreat next year.', timestamp: '2024-07-28T18:00:00Z' },
      { id: 'm3-2', sender: 'them', text: 'We have availability. Let\'s discuss details.', timestamp: '2024-07-28T18:05:00Z' },
    ]
  },
];
