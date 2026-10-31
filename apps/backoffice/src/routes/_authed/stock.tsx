import { createFileRoute } from '@tanstack/react-router';
import { StockPage } from '@/pages/(inventory)/stock';

export const Route = createFileRoute('/_authed/stock')({
  component: StockPage,
});
