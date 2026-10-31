import { Socket } from 'phoenix';
import { env } from '@/config/env';
import type { ChatMessage, Conversation, IceServer } from './support.types';

async function api<T>(path: string, token: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${env.VITE_SUPPORT_URL}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (!res.ok) throw new Error(`support api ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

export const fetchConversations = (token: string, signal?: AbortSignal) => api<Conversation[]>('/conversations', token, signal);
export const fetchMessages = (token: string, id: string, signal?: AbortSignal) => api<ChatMessage[]>(`/conversations/${id}/messages`, token, signal);
export const fetchIceServers = (token: string, signal?: AbortSignal) => api<IceServer[]>('/ice-servers', token, signal);

export function connectSocket(token: string): Socket {
  const url = env.VITE_SUPPORT_URL.replace(/^http/, 'ws') + '/socket';
  const socket = new Socket(url, { params: { token } });
  socket.connect();
  return socket;
}
