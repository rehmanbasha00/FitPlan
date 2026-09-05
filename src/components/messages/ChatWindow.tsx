'use client';

import { useEffect, useRef, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendMessage } from '@/store/slices/messageSlice';
import { getSocket } from '@/lib/socket';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import Skeleton from '@/components/ui/Skeleton';
import ParticipantProfileCard from './ParticipantProfileCard';

export default function ChatWindow() {
  const dispatch = useAppDispatch();
  const { conversations, messages, activeConversationId, status, typingConversationId } = useAppSelector(
    (s) => s.messages
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const profileAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showProfile) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!profileAnchorRef.current?.contains(event.target as Node)) setShowProfile(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [showProfile]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = messages.filter((m) => m.conversationId === activeConversationId);
  const isTyping = typingConversationId === activeConversationId;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, isTyping]);

  useEffect(() => {
    setShowProfile(false);
  }, [activeConversationId]);

  if (status === 'loading') {
    return <Skeleton className="h-full min-h-[320px]" />;
  }

  if (!activeConversation) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-ink-soft">
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative flex shrink-0 items-center gap-2 border-b border-surface-shell p-3" ref={profileAnchorRef}>
        <button
          type="button"
          onClick={() => !activeConversation.isGroup && setShowProfile((open) => !open)}
          disabled={activeConversation.isGroup}
          aria-label={activeConversation.isGroup ? undefined : `Open ${activeConversation.participant.name}'s profile`}
          aria-expanded={showProfile}
          className="focus-ring flex items-center gap-2 rounded-2xl px-1 py-1 text-left disabled:cursor-default"
        >
          <span className="relative">
            <Avatar src={activeConversation.participant.avatarUrl} alt={activeConversation.isGroup ? activeConversation.groupName || 'Trip group' : activeConversation.participant.name} size={32} />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                activeConversation.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
              aria-hidden="true"
            />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{activeConversation.isGroup ? `👥 ${activeConversation.groupName || 'Trip group'}` : activeConversation.participant.name}</p>
            <p className="text-xs text-ink-soft" aria-live="polite">
              {isTyping ? 'typing…' : activeConversation.isGroup ? `${activeConversation.memberIds?.length ?? 0} members` : activeConversation.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </button>

        {showProfile && !activeConversation.isGroup && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-40">
            <ParticipantProfileCard userId={activeConversation.participant.id} onClose={() => setShowProfile(false)} />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {activeMessages.length === 0 ? (
          <p className="text-center text-sm text-ink-soft">No messages yet — say hello!</p>
        ) : (
          activeMessages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        {isTyping && (
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-surface-muted px-4 py-3 w-fit" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        conversationId={activeConversationId}
        recipientUserId={activeConversation.isGroup ? undefined : activeConversation.participant.id}
        onText={(text) => {
          if (activeConversationId && activeConversation) {
            dispatch(sendMessage({ conversationId: activeConversationId, text })).then((result) => { if (sendMessage.fulfilled.match(result)) getSocket()?.emit('message:send', result.payload); });
          }
        }}
      />
    </div>
  );
}
