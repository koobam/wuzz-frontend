import { createFileRoute } from '@tanstack/react-router';
import { OutletDetailPage } from '@/pages/(catalog)/outlets/detail';

export const Route = createFileRoute('/_authed/outlets_/$id')({
  component: OutletDetailPage,
});
