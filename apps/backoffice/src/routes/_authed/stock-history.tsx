import { createFileRoute } from '@tanstack/react-router';
import { StockHistoryPage } from '@/pages/(inventory)/stock-history';

export const Route = createFileRoute('/_authed/stock-history')({
  component: StockHistoryPage,
});
