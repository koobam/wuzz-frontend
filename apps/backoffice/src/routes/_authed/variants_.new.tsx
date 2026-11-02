import { createFileRoute } from '@tanstack/react-router';
import { VariantFormPage } from '@/pages/(catalog)/variants/form';

export const Route = createFileRoute('/_authed/variants_/new')({
  component: VariantFormPage,
});
