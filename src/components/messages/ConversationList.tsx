'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveConversation } from '@/store/slices/messageSlice';
import ConversationItem from './ConversationItem';
import Skeleton from '@/components/ui/Skeleton';

export default function ConversationList() {
  const dispatch = useAppDispatch();
  const { conversations, activeConversationId, status } = useAppSelector((s) => s.messages);

  if (status === 'loading') {
    return (
      <div className="h-full space-y-2 overflow-y-auto p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2">
      <ul className="space-y-1" aria-label="Conversations">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeConversationId}
            onSelect={(id) => dispatch(setActiveConversation(id))}
          />
        ))}
      </ul>
    </div>
  );
}
