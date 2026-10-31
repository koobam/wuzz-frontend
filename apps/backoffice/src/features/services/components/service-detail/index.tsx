import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Badge, CatalogIcon, rupiah } from '@wuzz/web-ui';
import type { Service, ServiceCategory } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

const PILL = 'inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs whitespace-nowrap hover:bg-accent';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

/** A service, read-only: what it is, what it costs, and the variant and modifier groups it carries (each a link to the group). */
export function ServiceDetail({ service, category }: { service: Service; category?: ServiceCategory }) {
  const { t } = useTranslation();
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[22rem_1fr]">
      <dl className="rounded-3xl border border-border bg-card px-5 py-2">
        <Row label={t('services.columns.id')}>{service.id}</Row>
        <Row label={t('services.columns.name')}>
          <span className="flex items-center gap-2">
            <CatalogIcon name={service.icon} size={44} className="size-5" />
            {service.name}
          </span>
        </Row>
        <Row label={t('services.columns.category')}>
          {category ? (
            <span className="flex items-center gap-1.5">
              <CatalogIcon name={category.icon} className="size-4 text-muted-foreground" />
              {category.name}
            </span>
          ) : (
            t('services.noCategory')
          )}
        </Row>
        <Row label={t('services.columns.unit')}>{t(`unit.${service.unit}`)}</Row>
        <Row label={t('services.form.columns.priceBefore')}>{rupiah(service.price_before_tax)}</Row>
        {service.discount_type !== 'none' && (
          <>
            <Row label={t('services.form.discountType')}>
              {service.discount_type === 'percent' ? `${service.discount_value / 100}%` : rupiah(service.discount_value)}
            </Row>
            <Row label={t('services.form.discountAmount')}>− {rupiah(service.discount_amount)}</Row>
            <Row label={t('services.form.priceAfterDiscount')}>{rupiah(service.price_after_discount)}</Row>
          </>
        )}
        <Row label={t('services.form.taxType')}>
          {service.tax_type === 'none' ? t('services.form.taxNone') : t('services.form.taxPpn', { percent: service.tax_rate_bps / 100 })}
        </Row>
        <Row label={t('services.form.columns.tax')}>{rupiah(service.price_after_tax - service.price_after_discount)}</Row>
        <Row label={t('services.form.columns.priceAfter')}>{rupiah(service.price_after_tax)}</Row>
        <Row label={t('services.columns.status')}>
          <Badge tone={service.active ? 'good' : 'warn'}>{service.active ? t('status.record.active') : t('status.record.inactive')}</Badge>
        </Row>
      </dl>

      <section className="space-y-5 rounded-3xl border border-border bg-card p-5">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t('services.picker.variants')}</h3>
          {service.variant_groups.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('services.detail.noGroups')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {service.variant_groups.map((g) => (
                <Link key={g.id} to="/variants/$id" params={{ id: String(g.id) }} className={PILL}>{g.name}</Link>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t('services.picker.modifiers')}</h3>
          {service.modifier_groups.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('services.detail.noGroups')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {service.modifier_groups.map((g) => (
                <Link key={g.id} to="/modifiers/$id" params={{ id: String(g.id) }} className={PILL}>{g.name}</Link>
              ))}
            </div>
          )}
        </div>
        {service.internal_notes && (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{t('services.form.internalNotes')}</h3>
            <p className="text-sm whitespace-pre-line text-muted-foreground">{service.internal_notes}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">{t('services.priceNote')}</p>
      </section>
    </div>
  );
}
