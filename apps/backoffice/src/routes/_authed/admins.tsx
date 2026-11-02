import { createFileRoute } from '@tanstack/react-router';
import { AdminsPage } from '@/pages/(people)/admins';

export const Route = createFileRoute('/_authed/admins')({
  component: AdminsPage,
});
