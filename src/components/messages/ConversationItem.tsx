'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import Avatar from '@/components/ui/Avatar';
import { Conversation } from '@/types';
import ParticipantProfileCard from './ParticipantProfileCard';

interface ConversationItemProps {
  conversation: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
}

export default function ConversationItem({ conversation, active, onSelect }: ConversationItemProps) {
  const [showProfile, setShowProfile] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!showProfile) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) setShowProfile(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [showProfile]);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        aria-current={active ? 'true' : undefined}
        className={clsx(
          'focus-ring flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors',
          active ? 'bg-accent-soft' : 'hover:bg-surface-muted'
        )}
      >
        <span className="relative" ref={anchorRef}>
          <span
            role="button"
            tabIndex={conversation.isGroup ? -1 : 0}
            aria-label={conversation.isGroup ? undefined : `Open ${conversation.participant.name}'s profile`}
            onClick={(event) => {
              if (conversation.isGroup) return;
              event.stopPropagation();
              setShowProfile((open) => !open);
            }}
            className="block rounded-full focus-ring"
          >
            <Avatar src={conversation.participant.avatarUrl} alt={conversation.isGroup ? conversation.groupName || 'Trip group' : conversation.participant.name} size={38} />
          </span>
          <span
            className={clsx(
              'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white',
              conversation.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'
            )}
            aria-hidden="true"
          />
          {showProfile && !conversation.isGroup && (
            <span className="absolute left-0 top-[calc(100%+8px)] z-40" onClick={(event) => event.stopPropagation()}>
              <ParticipantProfileCard userId={conversation.participant.id} onClose={() => setShowProfile(false)} />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-ink">{conversation.isGroup ? `👥 ${conversation.groupName || 'Trip group'}` : conversation.participant.name}</span>
            <span className="shrink-0 text-[11px] text-ink-soft">{conversation.lastActivityLabel}</span>
          </span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            {conversation.isGroup ? `${conversation.memberIds?.length ?? 0} members` : conversation.status === 'online' ? 'Online' : conversation.lastActivityLabel}
          </span>
        </span>
        {conversation.unreadCount > 0 && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
            {conversation.unreadCount}
          </span>
        )}
      </button>
    </li>
  );
}
