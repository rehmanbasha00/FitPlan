'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setActiveConversation } from '@/store/slices/messageSlice';
import { AuthUser, Conversation } from '@/types';

export default function UserSearch({ onConversation }: { onConversation: (conversation: Conversation) => void }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();

  useEffect(() => {
    const value = query.trim();
    if (!value) {
      setUsers([]);
      setLoading(false);
      setError('');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/users?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Unable to search users');
        setUsers((await res.json()) as AuthUser[]);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setUsers([]);
          setError('Could not search users');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const startChat = async (id: string) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: id }),
    });
    if (!res.ok) {
      setError('Could not start conversation');
      return;
    }

    const conversation = (await res.json()) as Conversation;
    onConversation(conversation);
    dispatch(setActiveConversation(conversation.id));
    setOpen(false);
    setQuery('');
    setUsers([]);
  };

  return (
    <div className="relative border-b border-surface-shell p-2">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Find a person to chat..."
        aria-label="Find a person to chat"
        className="focus-ring w-full rounded-2xl bg-surface-muted px-3 py-2 text-xs"
      />

      {open && query.trim() && (
        <div className="absolute left-2 right-2 top-12 z-30 rounded-2xl border border-surface-shell bg-white p-1 shadow-card">
          {loading ? (
            <p className="px-3 py-3 text-xs text-ink-soft">Searching...</p>
          ) : error ? (
            <p className="px-3 py-3 text-xs text-red-500">{error}</p>
          ) : users.length > 0 ? (
            users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => startChat(user.id)}
                className="flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-surface-muted"
              >
                <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{user.name}</span>
                  <span className="block truncate text-[11px] text-ink-soft">@{user.username || user.email}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-xs text-ink-soft">No user found for “{query}”</p>
          )}
        </div>
      )}
    </div>
  );
}
