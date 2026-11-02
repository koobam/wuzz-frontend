import { useState } from 'react';
import { formatDecimal, roundTo } from '@wuzz/web-ui';
import type { BomOwner } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useRefreshCosting, useServiceCosting, useServices } from '@/services/hooks/apis';
import { difference } from '../utils/difference';

type Open = { owner: BomOwner; id: number } | null;

/** Recipes (BOM) and what they cost: the service picked, the option whose recipe is open, and the numbers of the overview. */
export function useCostingPage() {
  const { t, i18n } = useTranslation();
  const services = useServices();
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [open, setOpen] = useState<Open>(null);
  const costing = useServiceCosting(serviceId);
  const c = costing.data;
  const refresh = useRefreshCosting();

  return {
    t,
    language: i18n.language,
    services: services.data ?? [],
    serviceId,
    pickService: (id: number) => {
      setServiceId(id);
      setOpen(null);
    },
    costing: c,
    loading: costing.isLoading,
    error: services.error ?? costing.error,
    overview: c ? difference(c.service.price, c.base.per_unit) : null,
    /** A cost for people: two decimals, the thousands separator of the language. */
    dec: (s: string) => formatDecimal(roundTo(s, 2), i18n.language),
    isOpen: (owner: BomOwner, id: number) => open?.owner === owner && open.id === id,
    toggle: (owner: BomOwner, id: number) => setOpen((o) => (o?.owner === owner && o.id === id ? null : { owner, id })),
    refresh,
  };
}
