import { createFileRoute } from '@tanstack/react-router';
import { VariantsPage } from '@/pages/(catalog)/variants';

export const Route = createFileRoute('/_authed/variants')({
  component: VariantsPage,
});
