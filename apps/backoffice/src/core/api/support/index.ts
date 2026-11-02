import { Socket } from 'phoenix';
import { env } from '@/config/env';
import type { DirectConversation, ChatMessage } from './support.types';

async function call<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.VITE_SUPPORT_URL}/api${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  });
  if (!res.ok) throw new Error(`support api ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

/** Opens the direct thread with `peerId`, or resumes it: the same two people always share one. */
export const openDirect = (token: string, peerId: string) =>
  call<DirectConversation>('/conversations', token, { method: 'POST', body: JSON.stringify({ kind: 'direct', peer_id: peerId }) });

export const fetchMessages = (token: string, conversationId: string) =>
  call<ChatMessage[]>(`/conversations/${conversationId}/messages`, token);

/** One socket for the whole app; the token is read when it (re)connects, so a refreshed one is picked up. */
export function connectSocket(getToken: () => string): Socket {
  const url = env.VITE_SUPPORT_URL.replace(/^http/, 'ws') + '/socket';
  const socket = new Socket(url, { params: () => ({ token: getToken() }) });
  socket.connect();
  return socket;
}
