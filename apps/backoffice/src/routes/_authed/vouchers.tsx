import { createFileRoute } from '@tanstack/react-router';
import { VouchersPage } from '@/pages/(promotion)/vouchers';

export const Route = createFileRoute('/_authed/vouchers')({
  component: VouchersPage,
});
