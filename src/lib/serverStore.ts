import { initialConversations, initialEvents, initialTrips } from '@/data/mockData';
import { Trip, CalendarEvent, Conversation, Message, JourneyMemory, Wallet } from '@/types';
export interface StoredUser { id:string; name:string; email:string; phone:string; avatarUrl:string; username:string; bio:string; location:string; website:string; passwordHash:string; passwordSalt:string; }
export const db={trips:structuredClone(initialTrips) as Trip[],events:structuredClone(initialEvents) as CalendarEvent[],conversations:[] as Conversation[],messages:[] as Message[],journeyMemories:[] as JourneyMemory[],wallets:[] as Wallet[]};
export function nextId(prefix:string){return `${prefix}-${Math.random().toString(36).slice(2,10)}`;}
