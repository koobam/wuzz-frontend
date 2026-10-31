import { createFileRoute } from '@tanstack/react-router';
import { ServiceFormPage } from '@/pages/(catalog)/services/form';

export const Route = createFileRoute('/_authed/services_/new')({
  component: ServiceFormPage,
});
