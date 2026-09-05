import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message } from '@/types';

interface MessageState { conversations: Conversation[]; messages: Message[]; activeConversationId: string | null; status: 'idle'|'loading'|'succeeded'|'failed'; error: string|null; typingConversationId: string|null; }
const initialState: MessageState = { conversations: [], messages: [], activeConversationId: null, status: 'idle', error: null, typingConversationId: null };

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async () => {
  const res = await fetch('/api/messages');
  if (!res.ok) throw new Error('Failed to load messages');
  return (await res.json()) as { conversations: Conversation[]; messages: Message[] };
});
export const sendMessage = createAsyncThunk('messages/sendMessage', async (payload: { conversationId: string; text: string }) => {
  const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to send message');
  return (await res.json()) as Message;
});
export const respondToInvite = createAsyncThunk('messages/respondToInvite', async (payload: { messageId: string; response: 'accepted'|'rejected' }) => {
  const res = await fetch(`/api/messages/${payload.messageId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ response: payload.response }) });
  if (!res.ok) throw new Error('Failed to update invite');
  return (await res.json()) as Message;
});

const messageSlice = createSlice({
  name: 'messages', initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string>) { state.activeConversationId = action.payload; const conv = state.conversations.find((c) => c.id === action.payload); if (conv) conv.unreadCount = 0; },
    setConversationStatus(state, action: PayloadAction<{ userId: string; online: boolean }>) { state.conversations.forEach((c) => { if (c.participant.id === action.payload.userId) c.status = action.payload.online ? 'online' : 'offline'; }); },
    setTypingState(state, action: PayloadAction<{ conversationId: string; typing: boolean }>) { state.typingConversationId = action.payload.typing ? action.payload.conversationId : null; },
    receiveMessage(state, action: PayloadAction<Message>) { if (!state.messages.some((m) => m.id === action.payload.id)) state.messages.push(action.payload); const conv = state.conversations.find((c) => c.id === action.payload.conversationId); if (conv) { conv.lastActivityLabel = action.payload.timestamp; if (conv.id !== state.activeConversationId) conv.unreadCount += 1; } state.typingConversationId = null; }
  },
  extraReducers: (builder) => builder
    .addCase(fetchMessages.pending, (s) => { s.status = 'loading'; })
    .addCase(fetchMessages.fulfilled, (s, a) => { s.status = 'succeeded'; s.conversations = a.payload.conversations; s.messages = a.payload.messages; if (!s.activeConversationId && s.conversations[0]) s.activeConversationId = s.conversations[0].id; })
    .addCase(fetchMessages.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message ?? 'Something went wrong'; })
    .addCase(sendMessage.fulfilled, (s, a) => { if (!s.messages.some((m) => m.id === a.payload.id)) s.messages.push(a.payload); })
    .addCase(respondToInvite.fulfilled, (s, a) => { const i = s.messages.findIndex((m) => m.id === a.payload.id); if (i !== -1) s.messages[i] = a.payload; })
});
export const { setActiveConversation, setConversationStatus, setTypingState, receiveMessage } = messageSlice.actions;
export default messageSlice.reducer;
