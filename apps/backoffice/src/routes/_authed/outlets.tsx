import { createFileRoute } from '@tanstack/react-router';
import { OutletsPage } from '@/pages/(catalog)/outlets';

export const Route = createFileRoute('/_authed/outlets')({
  component: OutletsPage,
});
