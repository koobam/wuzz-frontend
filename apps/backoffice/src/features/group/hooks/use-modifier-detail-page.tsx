import { useParams } from '@tanstack/react-router';
import { Badge, rupiah } from '@wuzz/web-ui';
import { toId } from '@/core/utils/params';
import { useModifierGroup } from '@/services/hooks/apis';
import { modifierRule } from '../utils/modifier-rule';
import { useTranslation } from '@/core/utils/i18n';
import { OptionPill } from '../components/option-pill';

/** The modifier group page: the group named in the address, and how its rule and options are drawn. */
export function useModifierDetailPage() {
  const { id: raw } = useParams({ from: '/_authed/modifiers_/$id' });
  const id = toId(raw);
  const group = useModifierGroup(id);
  const g = group.data;
  const { t } = useTranslation();
  return {
    id,
    group: g,
    rule: g ? <Badge tone={g.min > 0 ? 'warn' : 'muted'}>{modifierRule(t, g)}</Badge> : null,
    options: g ? g.options.map((o) => <OptionPill key={o.id} name={o.name} off={!o.active} hint={o.price > 0 ? `+${rupiah(o.price)}` : undefined} />) : null,
    loading: !!id && group.isPending,
    isMissing: !id || (group.isError && !g),
    error: group.error,
  };
}
