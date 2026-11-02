import { useNavigate, useParams } from '@tanstack/react-router';
import type { Voucher } from '@/core/api';
import { ApiError } from '@/core/http';
import { toId } from '@/core/utils/params';
import { useVoucher } from '@/services/hooks/apis';

/**
 * The page that makes or edits a voucher: with an id in the address it edits that voucher, without one it makes a new one.
 * After saving it goes to the voucher's page; cancelling goes back to where it came from.
 */
export function useVoucherFormPage() {
  const { id: raw } = useParams({ strict: false }) as { id?: string };
  const editing = raw !== undefined;
  const id = toId(raw);
  const navigate = useNavigate();
  const voucher = useVoucher(id);
  const notFound = editing && (!id || (voucher.error instanceof ApiError && voucher.error.status === 404));

  return {
    editing,
    voucher: voucher.data,
    loading: editing && !!id && voucher.isPending,
    isMissing: notFound,
    error: notFound ? null : voucher.error,
    onSaved: (saved: Voucher) => void navigate({ to: '/vouchers/$id', params: { id: String(saved.id) } }),
    onCancel: () => void (id ? navigate({ to: '/vouchers/$id', params: { id: String(id) } }) : navigate({ to: '/vouchers' })),
  };
}
