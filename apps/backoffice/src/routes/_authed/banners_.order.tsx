import { createFileRoute } from '@tanstack/react-router';
import { BannerOrderPage } from '@/pages/(promotion)/banners/order';

export const Route = createFileRoute('/_authed/banners_/order')({
  component: BannerOrderPage,
});
