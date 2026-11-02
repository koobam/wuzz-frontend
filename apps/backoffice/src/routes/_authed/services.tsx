import { createFileRoute } from '@tanstack/react-router';
import { ServicesPage } from '@/pages/(catalog)/services';

export const Route = createFileRoute('/_authed/services')({
  component: ServicesPage,
});
