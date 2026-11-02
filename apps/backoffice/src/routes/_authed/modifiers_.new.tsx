import { createFileRoute } from '@tanstack/react-router';
import { ModifierFormPage } from '@/pages/(catalog)/modifiers/form';

export const Route = createFileRoute('/_authed/modifiers_/new')({
  component: ModifierFormPage,
});
