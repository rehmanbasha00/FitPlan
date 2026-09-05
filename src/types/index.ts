export type TripStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export interface Participant { id: string; name: string; avatarUrl: string; }
export interface Trip { id: string; name: string; destination: string; startDate: string; endDate: string; time: string; description: string; budget: number; participants: Participant[]; status: TripStatus; imageUrl: string; mapLat: number; mapLng: number; }
export type EventType = 'food' | 'outdoor' | 'sport' | 'travel';
export interface CalendarEvent { id: string; tripId?: string; title: string; date: string; time: string; imageUrl?: string; accent: 'blue' | 'green' | 'peach' | 'lilac'; type: EventType; location: string; description: string; participants: Participant[]; }
export interface User { id: string; name: string; avatarUrl: string; }
export interface AuthUser { id: string; name: string; email: string; phone?: string; avatarUrl: string; username?: string; bio?: string; location?: string; website?: string; }
export interface Conversation { id: string; ownerId?: string; participant: Participant; status: 'online' | 'offline'; lastActivityLabel: string; unreadCount: number; isGroup?: boolean; groupName?: string; memberIds?: string[]; tripId?: string; }
export type MessageKind = 'text' | 'trip-invite' | 'image' | 'video' | 'location';
export interface TripInvitePayload { title: string; date: string; time: string; imageUrl: string; responded?: 'accepted' | 'rejected'; }
export interface Message { id: string; conversationId: string; sender: 'me' | 'them'; senderUserId?: string;
  recipientUserId?: string; kind: MessageKind; text?: string; invite?: TripInvitePayload; mediaUrl?: string; fileName?: string; latitude?: number; longitude?: number; timestamp: string; }
export interface JourneyMemory { id: string; userId: string; year: number; date: string; place: string; thoughts: string; images: string[]; videos: string[]; createdAt: string; }
export interface Wallet { id: string; userId: string; tripId: string; savedAmount: number; targetAmount: number; updatedAt: string; }
