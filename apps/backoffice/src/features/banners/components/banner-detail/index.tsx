import { Link } from '@tanstack/react-router';
import { ImageOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge, ZoomableImage } from '@wuzz/web-ui';
import type { Banner } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { isShownImage } from '@/features/outlets/utils/outlet-form.schema';
import { liveState, LIVE_TONE, scheduleText, zoneName } from '../../utils/banner-display';
import { BANNER_RATIO } from '../../utils/banner-form.schema';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

/** A banner, read-only: its picture at the carousel's proportions, then what it is, where a tap goes, when it shows and at which outlets. */
export function BannerDetail({ banner, targetName }: { banner: Banner; targetName: string }) {
  const { t, i18n } = useTranslation();
  const state = liveState(banner);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <section className="min-w-0 space-y-4 rounded-3xl border border-border bg-card p-5">
        <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted" style={{ aspectRatio: `${BANNER_RATIO.width} / ${BANNER_RATIO.height}` }}>
          <ImageOff className="absolute inset-0 m-auto size-8 text-muted-foreground" aria-hidden />
          {isShownImage(banner.image_url) && <ZoomableImage src={banner.image_url} alt={banner.title} wrapperClassName="absolute inset-0 block h-full w-full rounded-none" className="h-full w-full object-cover" />}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{banner.title}</h2>
          {banner.internal_notes ? (
            <>
              <h3 className="pt-2 text-xs font-medium text-muted-foreground">{t('banners.form.internalNotes')}</h3>
              <p className="text-sm whitespace-pre-line">{banner.internal_notes}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t('banners.detail.noNotes')}</p>
          )}
        </div>
      </section>

      <dl className="min-w-0 rounded-3xl border border-border bg-card px-5 py-2">
        <Row label={t('banners.columns.id')}>{banner.id}</Row>
        <Row label={t('banners.columns.status')}>
          <Badge tone={banner.status === 'active' ? 'good' : 'warn'}>{banner.status === 'active' ? t('status.record.active') : t('status.record.inactive')}</Badge>
        </Row>
        <Row label={t('banners.columns.live')}>
          <Badge tone={LIVE_TONE[state]}>{t(`banners.live.${state}`)}</Badge>
        </Row>
        <Row label={t('banners.columns.target')}>
          {banner.target_type === 'none' ? (
            <span className="font-normal text-muted-foreground">{t('banners.target.none')}</span>
          ) : (
            <span className="flex flex-col items-end gap-1">
              <span className="flex items-center gap-1.5">
                <Badge tone="info" size="xs">{t(`banners.target.${banner.target_type}`)}</Badge>
                {banner.target_type === 'service' ? (
                  <Link to="/services/$id" params={{ id: banner.target_value }} className="hover:underline">{targetName}</Link>
                ) : banner.target_type === 'outlet' ? (
                  <Link to="/outlets/$id" params={{ id: banner.target_value }} className="hover:underline">{targetName}</Link>
                ) : (
                  <span className="break-all">{targetName}</span>
                )}
              </span>
            </span>
          )}
        </Row>
        <Row label={t('banners.form.deeplink')}>
          {banner.deeplink ? <Badge copy={banner.deeplink} tone="muted" size="sm">{banner.deeplink}</Badge> : <span className="font-normal text-muted-foreground">–</span>}
        </Row>
        <Row label={t('banners.columns.schedule', { zone: zoneName() })}>{scheduleText(banner.starts_at, banner.ends_at, t, i18n.language)}</Row>
        <Row label={t('banners.columns.outlets')}>
          {banner.outlets.length === 0 ? (
            t('banners.outlets.all')
          ) : (
            <span className="flex flex-wrap justify-end gap-1.5">
              {banner.outlets.map((o) => (
                <Link key={o.id} to="/outlets/$id" params={{ id: String(o.id) }} className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs hover:bg-accent">{o.name}</Link>
              ))}
            </span>
          )}
        </Row>
        <Row label={t('banners.detail.position')}>{banner.sort_index}</Row>
        <Row label={t('banners.detail.updated')}>{new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(banner.updated_at))}</Row>
      </dl>
    </div>
  );
}
