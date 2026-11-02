import { createFileRoute } from '@tanstack/react-router';
import { MaterialsPage } from '@/pages/(inventory)/materials';

export const Route = createFileRoute('/_authed/materials')({
  component: MaterialsPage,
});
