import { createFileRoute } from '@tanstack/react-router';
import { BannerFormPage } from '@/pages/(promotion)/banners/form';

export const Route = createFileRoute('/_authed/banners_/$id_/edit')({
  component: BannerFormPage,
});
