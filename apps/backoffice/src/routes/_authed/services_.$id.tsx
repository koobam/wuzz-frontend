import { createFileRoute } from '@tanstack/react-router';
import { ServiceDetailPage } from '@/pages/(catalog)/services/detail';

export const Route = createFileRoute('/_authed/services_/$id')({
  component: ServiceDetailPage,
});
