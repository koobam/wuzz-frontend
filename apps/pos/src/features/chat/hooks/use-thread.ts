import { zodResolver } from '@hookform/resolvers/zod';
import type { Channel } from 'phoenix';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type ChatMessage, connectSocket, fetchMessages } from '@/core/api';
import { messageSchema, type MessageValues } from '../utils/message.schema';
import { useCall } from './use-call';

/**
 * One conversation: its live channel and history, the message form and the call over it. The channel is joined before the
 * history is loaded so nothing sent in between is lost; the two are merged by message id.
 */
export function useThread(id: string, token: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channel = useRef<Channel | null>(null);
  const [joined, setJoined] = useState<Channel | null>(null);
  const call = useCall(joined, token);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const form = useForm<MessageValues>({ resolver: zodResolver(messageSchema), defaultValues: { body: '' } });

  useEffect(() => {
    let cancelled = false;
    const socket = connectSocket(token);
    const ch = socket.channel(`conversation:${id}`);
    channel.current = ch;

    const add = (incoming: ChatMessage[]) =>
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...incoming.filter((m) => !seen.has(m.id))];
      });
    ch.on('message', (m: ChatMessage) => add([m]));
    ch.join().receive('ok', () => setJoined(ch));
    fetchMessages(token, id).then((history) => !cancelled && add(history)).catch(() => undefined);

    return () => {
      cancelled = true;
      ch.leave();
      socket.disconnect();
    };
  }, [id, token]);

  useEffect(() => bottom.current?.scrollIntoView({ block: 'end' }), [messages]);
  useEffect(() => {
    if (localVideo.current) localVideo.current.srcObject = call.local;
    if (remoteVideo.current) remoteVideo.current.srcObject = call.remote;
  }, [call.local, call.remote]);

  const send = form.handleSubmit(({ body }) => {
    channel.current?.push('message', { body });
    form.reset();
  });

  return { messages, call, localVideo, remoteVideo, bottom, form, send };
}
