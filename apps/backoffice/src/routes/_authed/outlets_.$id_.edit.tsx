import { createFileRoute } from '@tanstack/react-router';
import { OutletFormPage } from '@/pages/(catalog)/outlets/form';

export const Route = createFileRoute('/_authed/outlets_/$id_/edit')({
  component: OutletFormPage,
});
