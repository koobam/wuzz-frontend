import { createFileRoute } from '@tanstack/react-router';
import { VoucherFormPage } from '@/pages/(promotion)/vouchers/form';

export const Route = createFileRoute('/_authed/vouchers_/new')({
  component: VoucherFormPage,
});
