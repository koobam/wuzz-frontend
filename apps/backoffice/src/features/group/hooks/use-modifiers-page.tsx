import { Badge, rupiah, useServerTable } from '@wuzz/web-ui';
import type { ModifierGroup } from '@/core/api';
import { modifierRule } from '../utils/modifier-rule';
import { useTranslation } from '@/core/utils/i18n';
import { useDeleteModifierGroup, useModifierGroups } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { OptionPill } from '../components/option-pill';
import type { Requirement } from '../components/requirement-filter';
import { modifierFiltersSchema } from '../utils/modifier-filters.schema';
import { useGroupColumns } from './use-group-columns';

/**
 * The modifier groups page: the list (searched, filtered, sorted and paged by the server), opening one (its page, its
 * form) and deleting. The page only draws what this returns.
 */
export function useModifiersPage() {
  const { t } = useTranslation();
  const table = useServerTable({ schema: modifierFiltersSchema });
  const groups = useModifierGroups({ ...table.params, requirement: table.filters.requirement, service_id: table.filters.service || undefined, usage: table.filters.usage });
  const labels = useTableLabels({ search: 'groups.search', showing: 'groups.showing' });
  const remove = useDeleteModifierGroup();
  const ask = useConfirmAction();

  const columns = useGroupColumns<ModifierGroup>({
    kind: 'modifiers',
    rule: (g) => <Badge tone={g.min > 0 ? 'warn' : 'muted'}>{modifierRule(t, g)}</Badge>,
    options: (g) => g.options.map((o) => <OptionPill key={o.id} name={o.name} off={!o.active} hint={o.price > 0 ? `+${rupiah(o.price)}` : undefined} />),
    busy: remove.isPending,
    onDelete: async (g) => {
      if (await ask.remove('modifier', g.name, g.services.length)) remove.mutate(g);
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
    requirement: { value: table.filters.requirement, onChange: (v: Requirement) => table.setFilter('requirement', v) },
  };
}
