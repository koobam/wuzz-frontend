import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { VoucherInjectionsPage } from '@/pages/(promotion)/voucher-injections';

export const Route = createFileRoute('/_authed/voucher-injections')({
  validateSearch: z.object({ voucher: z.number().int().positive().optional() }),
  component: VoucherInjectionsPage,
});
