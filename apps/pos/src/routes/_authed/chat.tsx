import { createFileRoute } from '@tanstack/react-router';
import { ChatPage } from '@/pages/(support)/chat';

export const Route = createFileRoute('/_authed/chat')({
  component: ChatPage,
});
