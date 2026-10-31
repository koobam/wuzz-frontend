import { Link } from '@tanstack/react-router';
import { ImageOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge, rupiah, ZoomableImage } from '@wuzz/web-ui';
import type { Voucher } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { isShownImage } from '@/features/outlets/utils/outlet-form.schema';
import { claimsText, discountText, liveState, LIVE_TONE, scheduleText, zoneName } from '../../utils/voucher-display';
import { VOUCHER_RATIO } from '../../utils/voucher-form.schema';
import { VoucherStub } from '../voucher-stub';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

const chip = 'inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs hover:bg-accent';

/** A voucher, read-only: its coupon and picture, what it is and what it is for, how it is claimed, when and where it can be used. */
export function VoucherDetail({ voucher: v }: { voucher: Voucher }) {
  const { t, i18n } = useTranslation();
  const state = liveState(v);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <section className="min-w-0 space-y-4 rounded-3xl border border-border bg-card p-5">
        <VoucherStub voucher={v} />
        {isShownImage(v.image_url) && (
          <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted" style={{ aspectRatio: `${VOUCHER_RATIO.width} / ${VOUCHER_RATIO.height}` }}>
            <ImageOff className="absolute inset-0 m-auto size-8 text-muted-foreground" aria-hidden />
            <ZoomableImage src={v.image_url} alt={v.title} wrapperClassName="absolute inset-0 block h-full w-full rounded-none" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{v.title}</h2>
          {v.description ? <p className="text-sm whitespace-pre-line">{v.description}</p> : <p className="text-sm text-muted-foreground">{t('vouchers.detail.noDescription')}</p>}
          <h3 className="pt-2 text-xs font-medium text-muted-foreground">{t('vouchers.form.internalNotes')}</h3>
          {v.internal_notes ? <p className="text-sm whitespace-pre-line">{v.internal_notes}</p> : <p className="text-sm text-muted-foreground">{t('vouchers.detail.noNotes')}</p>}
        </div>
      </section>

      <dl className="min-w-0 rounded-3xl border border-border bg-card px-5 py-2">
        <Row label={t('vouchers.columns.id')}>{v.id}</Row>
        <Row label={t('vouchers.columns.status')}>
          <Badge tone={v.status === 'active' ? 'good' : 'warn'}>{v.status === 'active' ? t('status.record.active') : t('status.record.inactive')}</Badge>
        </Row>
        <Row label={t('vouchers.columns.live')}>
          <Badge tone={LIVE_TONE[state]}>{t(`vouchers.live.${state}`)}</Badge>
        </Row>
        <Row label={t('vouchers.columns.discount')}>{discountText(v, t)}</Row>
        <Row label={t('vouchers.columns.minSpend')}>{v.min_spend > 0 ? rupiah(v.min_spend) : <span className="font-normal text-muted-foreground">–</span>}</Row>
        <Row label={t('vouchers.form.usageLimit')}>{t('vouchers.detail.perCustomer', { count: v.usage_limit })}</Row>
        <Row label={t('vouchers.detail.kind')}>
          <Badge tone={v.type === 'code' ? 'info' : 'muted'} size="xs">{t(`vouchers.type.${v.type}`)}</Badge>
        </Row>
        {v.type === 'code' && (
          <>
            <Row label={t('vouchers.form.code')}>
              <Badge copy={v.code} tone="info" size="sm">{v.code}</Badge>
            </Row>
            <Row label={t('vouchers.columns.claims')}>{claimsText(v)}</Row>
          </>
        )}
        <Row label={t('vouchers.columns.window', { zone: zoneName() })}>{scheduleText(v.starts_at, v.ends_at, t, i18n.language)}</Row>
        <Row label={t('vouchers.columns.outlets')}>
          {v.outlets.length === 0 ? (
            t('banners.outlets.all')
          ) : (
            <span className="flex flex-wrap justify-end gap-1.5">
              {v.outlets.map((o) => (
                <Link key={o.id} to="/outlets/$id" params={{ id: String(o.id) }} className={chip}>{o.name}</Link>
              ))}
            </span>
          )}
        </Row>
        <Row label={t('vouchers.detail.services')}>
          {v.services.length === 0 ? (
            t('vouchers.detail.allServices')
          ) : (
            <span className="flex flex-wrap justify-end gap-1.5">
              {v.services.map((s) => (
                <Link key={s.id} to="/services/$id" params={{ id: String(s.id) }} className={chip}>{s.name}</Link>
              ))}
            </span>
          )}
        </Row>
        <Row label={t('vouchers.detail.updated')}>{new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v.updated_at))}</Row>
      </dl>
    </div>
  );
}
