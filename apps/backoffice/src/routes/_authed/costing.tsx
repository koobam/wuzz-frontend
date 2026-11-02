import { createFileRoute } from '@tanstack/react-router';
import { CostingPage } from '@/pages/(inventory)/costing';

export const Route = createFileRoute('/_authed/costing')({
  component: CostingPage,
});
