import { createFileRoute } from '@tanstack/react-router';
import { OrderDetailPage } from '@/pages/(sales)/orders/detail';

export const Route = createFileRoute('/_authed/orders_/$id')({
  component: OrderDetailPage,
});
