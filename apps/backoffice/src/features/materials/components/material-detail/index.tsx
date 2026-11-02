import type { ReactNode } from 'react';
import { Badge, formatDecimal, roundTo, rupiah } from '@wuzz/web-ui';
import type { Material } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useDateFormat } from '@/services/hooks/use-date-format';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

/** A material, read-only: SKU, category, unit, what a purchase costs and holds (the cost of one unit is the exact fraction), where it is used. */
export function MaterialDetail({ material: m }: { material: Material }) {
  const { t, i18n } = useTranslation();
  const date = useDateFormat();
  const unit = t(`materials.unit.${m.unit}`);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[22rem_1fr]">
      <dl className="rounded-3xl border border-border bg-card px-5 py-2">
        <Row label={t('materials.columns.id')}>{m.id}</Row>
        <Row label={t('materials.columns.sku')}><span className="font-mono">{m.sku}</span></Row>
        <Row label={t('materials.form.name')}>{m.name}</Row>
        <Row label={t('materials.form.category')}>{t(`materials.category.${m.category}`)}</Row>
        <Row label={t('materials.form.unit')}>{unit}</Row>
        <Row label={t('materials.columns.status')}><Badge tone={m.active ? 'good' : 'muted'}>{m.active ? t('materials.active') : t('materials.inactive')}</Badge></Row>
      </dl>
      <dl className="rounded-3xl border border-border bg-card px-5 py-2">
        <Row label={t('materials.columns.purchase')}>
          {rupiah(m.purchase_price)} {t('materials.for')} {formatDecimal(m.purchase_qty, i18n.language)} {unit}
        </Row>
        <Row label={t('materials.columns.unitCost')}>≈ Rp {formatDecimal(roundTo(m.unit_cost, 2), i18n.language)} {t('materials.per')} {unit}</Row>
        <Row label={t('materials.columns.usedIn')}>{m.used_in ? t('materials.bomLines', { count: m.used_in }) : t('materials.notUsed')}</Row>
        <Row label={t('materials.form.notes')}>{m.notes || '–'}</Row>
        <Row label={t('materials.columns.created')}>{date(m.created_at)}</Row>
        <Row label={t('materials.columns.updated')}>{date(m.updated_at)}</Row>
      </dl>
    </div>
  );
}
