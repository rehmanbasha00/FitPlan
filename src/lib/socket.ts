'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(userId: string) {
  if (!userId) return null;
  if (socket?.connected && socket.auth?.userId === userId) return socket;
  socket?.disconnect();
  socket = io(typeof window !== 'undefined' ? window.location.origin : undefined, {
    auth: { userId },
    transports: ['websocket', 'polling'],
    autoConnect: true
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
