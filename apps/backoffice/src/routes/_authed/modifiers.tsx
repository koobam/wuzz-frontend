import { createFileRoute } from '@tanstack/react-router';
import { ModifiersPage } from '@/pages/(catalog)/modifiers';

export const Route = createFileRoute('/_authed/modifiers')({
  component: ModifiersPage,
});
