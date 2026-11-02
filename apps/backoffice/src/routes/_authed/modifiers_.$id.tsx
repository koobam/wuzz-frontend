import { createFileRoute } from '@tanstack/react-router';
import { ModifierDetailPage } from '@/pages/(catalog)/modifiers/detail';

export const Route = createFileRoute('/_authed/modifiers_/$id')({
  component: ModifierDetailPage,
});
