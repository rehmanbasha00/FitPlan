'use client';
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { getSocket } from '@/lib/socket';
interface MessageInputProps { onSend: (text: string) => void; disabled?: boolean; conversationId?: string | null; }
export default function MessageInput({ onSend, disabled, conversationId }: MessageInputProps) {
  const [text, setText] = useState(''); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const handleChange = (value: string) => { setText(value); if (conversationId) { getSocket()?.emit('typing:start', { conversationId }); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => getSocket()?.emit('typing:stop', { conversationId }), 900); } };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const trimmed = text.trim(); if (!trimmed) return; onSend(trimmed); setText(''); if (conversationId) getSocket()?.emit('typing:stop', { conversationId }); };
  return <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-surface-shell p-3"><label htmlFor="message-input" className="sr-only">Enter a message</label><input id="message-input" value={text} onChange={(e) => handleChange(e.target.value)} placeholder="Enter Text..." disabled={disabled} className="focus-ring flex-1 rounded-full bg-surface-muted px-4 py-2.5 text-sm placeholder:text-ink-soft/70"/><Button type="submit" size="icon" disabled={disabled || !text.trim()} aria-label="Send message">➤</Button></form>;
}
