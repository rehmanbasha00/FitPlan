import { CalendarEvent, Conversation, Message, Participant, Trip } from '@/types';

export const participants: Record<string, Participant> = {
  jane: { id: 'jane', name: 'Jane Cooper', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' },
  jenny: { id: 'jenny', name: 'Jenny Wilson', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces' },
  broklyn: { id: 'broklyn', name: 'Broklyn Simon', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces' },
  theresa: { id: 'theresa', name: 'Theresa Angel', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces' },
  kim: { id: 'kim', name: 'Kim Minji', avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=faces' },
  brian: { id: 'brian', name: 'Brian Tracy', avatarUrl: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=80&h=80&fit=crop&crop=faces' }
};

export const currentUser = {
  id: 'wendy',
  name: 'Wendy',
  avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&crop=faces'
};

export const initialTrips: Trip[] = [
  {
    id: 'trip-switzerland',
    name: 'Traveling to Switzerland',
    destination: 'Switzerland',
    startDate: '2023-11-11',
    endDate: '2023-11-16',
    time: '11:00 AM',
    description: 'A week exploring the Swiss Alps, lakeside towns and mountain trails with the crew.',
    budget: 3200,
    participants: [participants.jane, participants.jenny, participants.broklyn],
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&h=700&fit=crop',
    mapLat: 46.8182,
    mapLng: 8.2275
  },
  {
    id: 'trip-ranca-upas',
    name: 'Camping at Ranca Upas',
    destination: 'Ranca Upas, Bandung',
    startDate: '2023-12-11',
    endDate: '2023-12-12',
    time: '11:00 AM',
    description: 'Weekend camping trip with bonfire, stargazing and morning trekking.',
    budget: 180,
    participants: [participants.kim, participants.brian],
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=1200&h=700&fit=crop',
    mapLat: -7.1497,
    mapLng: 107.6631
  },
  {
    id: 'trip-forest-park',
    name: 'Explore Forest Park',
    destination: 'Forest Park',
    startDate: '2023-12-13',
    endDate: '2023-12-13',
    time: '10:00 AM',
    description: 'Guided nature walk through the forest reserve trails.',
    budget: 40,
    participants: [participants.theresa, participants.jane, participants.jenny],
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=700&fit=crop',
    mapLat: 45.5051,
    mapLng: -122.6750
  }
];

export const initialEvents: CalendarEvent[] = [
  {
    id: 'evt-dimsum',
    tripId: undefined,
    title: 'Imperial Dimsum',
    date: '2023-12-10',
    time: '11:00 AM',
    accent: 'blue',
    type: 'food',
    location: 'Imperial Dimsum Restaurant',
    description: 'Team lunch before the weekend trips kick off.',
    participants: [participants.jane]
  },
  {
    id: 'evt-camping',
    tripId: 'trip-ranca-upas',
    title: 'Camping at Ranca Upas',
    date: '2023-12-11',
    time: '11:00 AM',
    imageUrl: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&h=400&fit=crop',
    accent: 'lilac',
    type: 'outdoor',
    location: 'Ranca Upas, Bandung',
    description: 'Weekend camping trip with bonfire, stargazing and morning trekking.',
    participants: [participants.kim, participants.brian]
  },
  {
    id: 'evt-forest',
    tripId: 'trip-forest-park',
    title: 'Explore Forest Park',
    date: '2023-12-13',
    time: '10:00 AM',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    accent: 'green',
    type: 'outdoor',
    location: 'Forest Park',
    description: 'Guided nature walk through the forest reserve trails.',
    participants: [participants.theresa, participants.jane, participants.jenny, participants.kim, participants.brian]
  },
  {
    id: 'evt-soccer',
    title: 'Mini Soccer',
    date: '2023-12-14',
    time: '4:00 PM',
    accent: 'peach',
    type: 'sport',
    location: 'Community Sports Hall',
    description: 'Friendly 5-a-side match with the group.',
    participants: [participants.broklyn, participants.brian]
  }
];

export const initialConversations: Conversation[] = [
  { id: 'conv-jane', participant: participants.jane, status: 'online', lastActivityLabel: '15:00', unreadCount: 2 },
  { id: 'conv-jenny', participant: participants.jenny, status: 'online', lastActivityLabel: '13:45', unreadCount: 0 },
  { id: 'conv-broklyn', participant: participants.broklyn, status: 'offline', lastActivityLabel: '10 Minutes ago', unreadCount: 1 },
  { id: 'conv-theresa', participant: participants.theresa, status: 'offline', lastActivityLabel: '30 Minutes ago', unreadCount: 3 },
  { id: 'conv-kim', participant: participants.kim, status: 'offline', lastActivityLabel: '8 Minutes ago', unreadCount: 0 },
  { id: 'conv-brian', participant: participants.brian, status: 'offline', lastActivityLabel: '20 Minutes ago', unreadCount: 0 }
];

export const initialMessages: Message[] = [
  { id: 'm1', conversationId: 'conv-jane', sender: 'them', kind: 'text', text: 'Morning \u2600\ufe0f', timestamp: '12:49' },
  { id: 'm2', conversationId: 'conv-jane', sender: 'them', kind: 'text', text: "Let's join us Wendy!", timestamp: '12:50' },
  { id: 'm3', conversationId: 'conv-jane', sender: 'me', kind: 'text', text: 'Sure Jenny :)', timestamp: '13:00' },
  {
    id: 'm4',
    conversationId: 'conv-jane',
    sender: 'them',
    kind: 'trip-invite',
    invite: {
      title: 'Sunset at Jimbaran',
      date: '16 Nov',
      time: '16:00 PM',
      imageUrl: 'https://images.unsplash.com/photo-1518544866330-4c7a63e5b2a2?w=400&h=300&fit=crop'
    },
    timestamp: '13:20'
  },
  { id: 'm5', conversationId: 'conv-jane', sender: 'me', kind: 'text', text: "That's cool, see you soon \ud83d\ude0e", timestamp: '13:20' }
];
