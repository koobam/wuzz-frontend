import { useNavigate, useParams } from '@tanstack/react-router';
import { useServerTable } from '@wuzz/web-ui';
import { z } from 'zod';
import { ApiError } from '@/core/http';
import { toId } from '@/core/utils/params';
import { useDeleteVoucher, useSetVoucherStatus, useVoucher, useVoucherHolders } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';

const holdersSchema = z.object({});

/** The voucher page: the voucher named in the address, who holds it (a searchable, paged list), and turning it on or off and deleting it (each after a confirmation; deleting goes back to the list). */
export function useVoucherDetailPage() {
  const { id: raw } = useParams({ from: '/_authed/vouchers_/$id' });
  const id = toId(raw);
  const navigate = useNavigate();
  const ask = useConfirmAction();
  const status = useSetVoucherStatus();
  const remove = useDeleteVoucher({ onDeleted: () => void navigate({ to: '/vouchers' }) });
  // Once the voucher is being deleted its page must not ask for it again (the server would answer 404).
  const voucher = useVoucher(id, { enabled: !remove.isPending && !remove.isSuccess });
  const holdersTable = useServerTable({ schema: holdersSchema, pageSize: 10, defaultSort: { id: 'claimed_at', desc: true } });
  const holders = useVoucherHolders(id, { q: holdersTable.q || undefined, limit: holdersTable.pageSize, offset: holdersTable.offset });
  const notFound = !id || (voucher.error instanceof ApiError && voucher.error.status === 404);

  return {
    id,
    voucher: voucher.data,
    loading: !!id && voucher.isPending,
    isMissing: notFound && !remove.isPending && !remove.isSuccess,
    error: notFound ? null : (voucher.error ?? status.error ?? remove.error),
    busy: status.isPending || remove.isPending,
    holders: { table: holdersTable, rows: holders.data?.items ?? [], total: holders.data?.total ?? 0, ready: !!holders.data, error: holders.error },
    onDelete: async () => {
      if (voucher.data && (await ask.remove('voucher', voucher.data.title))) remove.mutate(voucher.data);
    },
    onToggle: async () => {
      const v = voucher.data;
      if (!v) return;
      const to = v.status !== 'active';
      if (await ask.toggle('voucher', v.title, to)) status.mutate({ id: v.id, status: to ? 'active' : 'inactive' });
    },
    onSend: () => void navigate({ to: '/voucher-injections', search: { voucher: id } }),
  };
}
