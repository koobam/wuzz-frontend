import { createFileRoute } from '@tanstack/react-router';
import { NewOrderPage } from '@/pages/(sales)/new-order';

export const Route = createFileRoute('/_authed/')({
  component: NewOrderPage,
});
