export type Conversation = {
  id: string;
  name: string;
  role: string;
  retreat: string;
  lastMessage: string;
  avatar: string;
  unread: boolean;
};

// This is placeholder data. In a real application, this would come from a database.
export const mockConversations: Conversation[] = [
  { id: 'conv1', name: 'Asha Sharma', role: 'Guide', retreat: 'The Glass House Inquiry', lastMessage: 'This looks like a great fit! Can you confirm availability for November?', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', unread: true },
  { id: 'conv2', name: 'Local Caterers', role: 'Vendor', retreat: 'The Glass House Inquiry', lastMessage: 'Yes, we can provide a sample menu for 25 guests.', avatar: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=200', unread: true },
  { id: 'conv3', name: 'Ubud Jungle Haven', role: 'Host', retreat: 'Sunrise Yoga in Bali', lastMessage: 'We have availability. Let\'s discuss details.', avatar: 'https://images.unsplash.com/photo-1600585154340-be6164a83639?w=200', unread: false },
];
