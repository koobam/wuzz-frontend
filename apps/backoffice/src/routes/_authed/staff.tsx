import { createFileRoute } from '@tanstack/react-router';
import { StaffPage } from '@/pages/(people)/staff';

export const Route = createFileRoute('/_authed/staff')({
  component: StaffPage,
});
