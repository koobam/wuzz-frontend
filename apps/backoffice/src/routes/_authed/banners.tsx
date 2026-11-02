import { createFileRoute } from '@tanstack/react-router';
import { BannersPage } from '@/pages/(promotion)/banners';

export const Route = createFileRoute('/_authed/banners')({
  component: BannersPage,
});
