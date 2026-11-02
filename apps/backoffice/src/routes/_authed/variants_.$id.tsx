import { createFileRoute } from '@tanstack/react-router';
import { VariantDetailPage } from '@/pages/(catalog)/variants/detail';

export const Route = createFileRoute('/_authed/variants_/$id')({
  component: VariantDetailPage,
});
