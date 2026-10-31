import { createFileRoute } from '@tanstack/react-router';
import { MaterialFormPage } from '@/pages/(inventory)/materials/form';

export const Route = createFileRoute('/_authed/materials_/$id_/edit')({
  component: MaterialFormPage,
});
