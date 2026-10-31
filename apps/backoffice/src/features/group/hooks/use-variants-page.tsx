import { Badge, rupiah, useServerTable } from '@wuzz/web-ui';
import type { VariantGroup } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useDeleteVariantGroup, useVariantGroups } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { OptionPill } from '../components/option-pill';
import { variantFiltersSchema } from '../utils/variant-filters.schema';
import { useGroupColumns } from './use-group-columns';

/**
 * The variant groups page: the list (searched, filtered, sorted and paged by the server), opening one (its page, its
 * form) and deleting. The page only draws what this returns.
 */
export function useVariantsPage() {
  const { t } = useTranslation();
  const table = useServerTable({ schema: variantFiltersSchema });
  const groups = useVariantGroups({ ...table.params, service_id: table.filters.service || undefined, usage: table.filters.usage });
  const labels = useTableLabels({ search: 'groups.search', showing: 'groups.showing' });
  const remove = useDeleteVariantGroup();
  const ask = useConfirmAction();

  const columns = useGroupColumns<VariantGroup>({
    kind: 'variants',
    // A variant is always exactly one choice.
    rule: () => <Badge tone="warn">{t('groups.modifiers.ruleExact', { n: 1 })}</Badge>,
    options: (g) =>
      g.options.map((o) => <OptionPill key={o.id} name={o.name} isDefault={o.is_default} off={!o.active} hint={o.price_delta > 0 ? `+${rupiah(o.price_delta)}` : undefined} />),
    busy: remove.isPending,
    onDelete: async (g) => {
      if (await ask.remove('variant', g.name, g.services.length)) remove.mutate(g);
    },
  });

  return {
    table,
    labels,
    columns,
    rows: groups.data?.items ?? [],
    total: groups.data?.total ?? 0,
    ready: !!groups.data,
    error: groups.error ?? remove.error,
    filters: {
      service: table.filters.service,
      usage: table.filters.usage,
      onService: (v: number) => table.setFilter('service', v),
      onUsage: (v: '' | 'used' | 'unused') => table.setFilter('usage', v),
    },
  };
}
