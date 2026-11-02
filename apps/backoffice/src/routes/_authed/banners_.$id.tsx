import { createFileRoute } from '@tanstack/react-router';
import { BannerDetailPage } from '@/pages/(promotion)/banners/detail';

export const Route = createFileRoute('/_authed/banners_/$id')({
  component: BannerDetailPage,
});
