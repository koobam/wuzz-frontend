import { useParams } from '@tanstack/react-router';
import { Badge, rupiah } from '@wuzz/web-ui';
import { toId } from '@/core/utils/params';
import { useVariantGroup } from '@/services/hooks/apis';
import { useTranslation } from '@/core/utils/i18n';
import { OptionPill } from '../components/option-pill';

/** The variant group page: the group named in the address, and how its rule and options are drawn. */
export function useVariantDetailPage() {
  const { id: raw } = useParams({ from: '/_authed/variants_/$id' });
  const id = toId(raw);
  const group = useVariantGroup(id);
  const g = group.data;
  const { t } = useTranslation();
  return {
    id,
    group: g,
    rule: g ? <Badge tone="warn">{t('groups.modifiers.ruleExact', { n: 1 })}</Badge> : null,
    options: g ? g.options.map((o) => <OptionPill key={o.id} name={o.name} isDefault={o.is_default} off={!o.active} hint={o.price_delta > 0 ? `+${rupiah(o.price_delta)}` : undefined} />) : null,
    loading: !!id && group.isPending,
    isMissing: !id || (group.isError && !g),
    error: group.error,
  };
}
