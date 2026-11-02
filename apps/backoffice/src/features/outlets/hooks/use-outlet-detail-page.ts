import { useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { toId } from '@/core/utils/params';
import { useAccounts, useDeleteOutlet, useOutlets } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';

/** The outlet page: the outlet named in the address (the list has them all; there is no request for one), and the people who work there. */
export function useOutletDetailPage() {
  const { id: raw } = useParams({ from: '/_authed/outlets_/$id' });
  const id = toId(raw);
  const outlets = useOutlets();
  const outlet = id ? outlets.data?.find((o) => o.id === id) : undefined;
  const navigate = useNavigate();
  const ask = useConfirmAction();
  const remove = useDeleteOutlet({ onDeleted: () => void navigate({ to: '/outlets' }) });
  // The people of this outlet: its staff and the admins tied to it (the first ten of each; the staff page has the rest).
  const staff = useAccounts('staff', { outlet_id: id ?? 0, limit: 10 }, { enabled: !!outlet });
  const admins = useAccounts('admins', { outlet_id: id ?? 0, limit: 10 }, { enabled: !!outlet });

  const markers = useMemo(() => (outlet ? [{ id: outlet.id, name: outlet.name, address: outlet.address, phone: outlet.phone, image: outlet.images[0] ?? '', latitude: outlet.latitude, longitude: outlet.longitude, active: outlet.active }] : []), [outlet]);

  return {
    id,
    outlet,
    markers,
    people: {
      staff: staff.data?.items ?? [],
      admins: admins.data?.items ?? [],
      total: staff.data?.total ?? 0,
      loading: staff.isPending || admins.isPending,
      error: staff.error ?? admins.error,
    },
    loading: !!id && outlets.isPending,
    isMissing: !id || (outlets.isSuccess && !outlet && !remove.isPending && !remove.isSuccess),
    error: outlets.error ?? remove.error,
    deleting: remove.isPending,
    onDelete: async () => {
      if (outlet && (await ask.remove('outlet', outlet.name))) remove.mutate(outlet);
    },
  };
}
