'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { fetchMessages, receiveMessage, setConversationStatus, setTypingState } from '@/store/slices/messageSlice';
export default function ChatSocketBridge() {
  const dispatch = useAppDispatch(); const user = useAppSelector((s) => s.auth.user); const conversations = useAppSelector((s) => s.messages.conversations);
  useEffect(() => {
    if (!user) return; const socket = connectSocket(user.id); if (!socket) return;
    const join = () => conversations.forEach((c) => socket.emit('conversation:join', c.id));
    const onMessage = async (m: any) => { if (m.senderUserId && !conversations.some((c) => c.id === m.conversationId || c.participant.id === m.senderUserId)) { await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participantId: m.senderUserId }) }); await dispatch(fetchMessages()); } dispatch(receiveMessage({ ...m, sender: 'them' })); };
    const onPresence = (p: any) => dispatch(setConversationStatus(p)); const onTyping = (p: any) => dispatch(setTypingState(p));
    socket.on('connect', join); socket.on('message:receive', onMessage); socket.on('presence:update', onPresence); socket.on('typing:update', onTyping); join();
    return () => { socket.off('connect', join); socket.off('message:receive', onMessage); socket.off('presence:update', onPresence); socket.off('typing:update', onTyping); disconnectSocket(); };
  }, [dispatch, user]);
  useEffect(() => { const socket = connectSocket(user?.id || ''); if (!socket) return; conversations.forEach((c) => socket.emit('conversation:join', c.id)); }, [conversations, user?.id]);
  return null;
}
