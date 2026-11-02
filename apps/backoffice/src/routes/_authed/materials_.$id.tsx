import { createFileRoute } from '@tanstack/react-router';
import { MaterialDetailPage } from '@/pages/(inventory)/materials/detail';

export const Route = createFileRoute('/_authed/materials_/$id')({
  component: MaterialDetailPage,
});
