'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatWindow from '@/components/messages/ChatWindow';
import ChatSocketBridge from '@/components/messages/ChatSocketBridge';
import UserSearch from '@/components/messages/UserSearch';
import GroupCreator from '@/components/messages/GroupCreator';
import { useAppDispatch } from '@/store/hooks';
import { fetchMessages } from '@/store/slices/messageSlice';

export default function MessagesPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  return (
    <DashboardLayout>
      <section className="grid h-[70vh] min-h-[480px] grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-soft sm:grid-cols-[260px_1fr]">
        <div className="h-full min-h-0 overflow-hidden border-b border-surface-shell sm:border-b-0 sm:border-r">
          <UserSearch onConversation={() => dispatch(fetchMessages())} />
          <GroupCreator onCreated={(conversation) => { dispatch(fetchMessages()); }} />
          <ConversationList />
        </div>
        <div className="h-full min-h-0 overflow-hidden">
          <ChatWindow />
        </div>
      </section>
      <ChatSocketBridge />
    </DashboardLayout>
  );
}
