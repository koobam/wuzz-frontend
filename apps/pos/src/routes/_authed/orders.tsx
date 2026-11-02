import { createFileRoute } from '@tanstack/react-router';
import { OrdersPage } from '@/pages/(sales)/orders';

export const Route = createFileRoute('/_authed/orders')({
  component: OrdersPage,
});
