import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from '@/components/messages/ChatWindow';
import { renderWithStore } from '../testUtils';
import { makeStore } from '@/store';
import { initialConversations, initialMessages } from '@/data/mockData';

describe('ChatWindow', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString();
        if (url.endsWith('/api/messages') && (!init || init.method === undefined)) {
          return new Response(
            JSON.stringify({ conversations: initialConversations, messages: initialMessages }),
            { status: 200 }
          );
        }
        if (url.endsWith('/api/messages') && init?.method === 'POST') {
          const body = JSON.parse(init.body as string);
          return new Response(
            JSON.stringify({
              id: 'msg-new',
              conversationId: body.conversationId,
              sender: 'me',
              kind: 'text',
              text: body.text,
              timestamp: '14:00'
            }),
            { status: 201 }
          );
        }
        return new Response('Not found', { status: 404 });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a new message and renders it in the thread', async () => {
    const user = userEvent.setup();
    const store = makeStore();
    await store.dispatch({ type: 'messages/fetchMessages/fulfilled', payload: { conversations: initialConversations, messages: initialMessages } });

    renderWithStore(<ChatWindow />, store);

    const input = screen.getByPlaceholderText(/enter text/i);
    await user.type(input, 'Hey, see you there!');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText('Hey, see you there!')).toBeInTheDocument();
    });
  });
});
