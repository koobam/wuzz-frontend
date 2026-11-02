import { createFileRoute } from '@tanstack/react-router';
import { VoucherDetailPage } from '@/pages/(promotion)/vouchers/detail';

export const Route = createFileRoute('/_authed/vouchers_/$id')({
  component: VoucherDetailPage,
});
