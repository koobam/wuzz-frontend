import type { ActivityEntity, ActivityEntry } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useActiveMaterials, useOutlets } from '@/services/hooks/apis';

const text = (v: unknown) => (v === null || v === undefined || v === '' ? undefined : String(v));

/**
 * Turns an entry into its sentence ("Admin edited outlet 'Kelapa Gading'"). The wording is the entry's own `summary.key`
 * (`activity.<entity>.<action>`) with its params; ids that mean something to a reader (an outlet, a material) are
 * replaced by their names when the list has them, else shown as `#id`. A key nobody has written yet reads from the
 * action and the kind of thing, so a new log line is never an error.
 */
export function useActivitySentence(entityType: ActivityEntity) {
  const { t, i18n } = useTranslation();
  const outlets = useOutlets({ enabled: entityType === 'stock' });
  const materials = useActiveMaterials({ enabled: entityType === 'stock' });

  const outletName = (id: unknown) => {
    const wanted = text(id);
    if (!wanted) return '';
    return outlets.data?.find((o) => String(o.id) === wanted)?.name ?? `#${wanted}`;
  };
  const materialName = (id: string) => materials.data?.find((m) => String(m.id) === id)?.name ?? `#${id}`;

  return (entry: ActivityEntry): string => {
    const p = entry.summary.params ?? {};
    const [ownerType, ownerId] = entry.entity_id.split(':');
    const subject =
      entry.entity_type === 'bom'
        ? `${t(`activity.bomOwner.${ownerType}`, { defaultValue: ownerType ?? '' })} #${ownerId ?? ''}`
        : entry.entity_type === 'stock'
          ? materialName(entry.entity_id)
          : `#${entry.entity_id}`;
    const status = text(p.status);
    const vars = {
      subject,
      name: text(p.name) ?? subject,
      title: text(p.title) ?? subject,
      total: text(p.total) ?? text(p.target_count) ?? '',
      injected: text(p.injected_count) ?? '',
      sku: text(p.sku) ?? '',
      code: text(p.code) ?? subject,
      qty: text(p.qty) ?? '',
      counted: text(p.counted_qty) ?? '',
      min: text(p.min_qty) ?? '',
      reason: text(p.reason) ? t(`stock.reason.${p.reason}`, { defaultValue: String(p.reason) }) : '',
      status: status ? t(`status.${entry.entity_type === 'order' ? 'order' : entry.entity_type === 'banner' || entry.entity_type === 'voucher' ? 'record' : 'user'}.${status}`, { defaultValue: status }) : '',
      outlet: outletName(p.outlet_id),
      from: outletName(p.from_outlet_id),
      to: outletName(p.to_outlet_id),
    };
    if (i18n.exists(entry.summary.key)) return t(entry.summary.key, vars);
    return t('activity.fallback', {
      action: t(`activity.actions.${entry.action}`, { defaultValue: entry.action }),
      entity: t(`activity.entities.${entry.entity_type}`, { defaultValue: entry.entity_type }),
      subject,
    });
  };
}
