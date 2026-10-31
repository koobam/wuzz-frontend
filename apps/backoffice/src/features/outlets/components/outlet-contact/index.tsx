import { ExternalLink, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@wuzz/web-ui';
import type { Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</span>
      <div className="min-w-0 space-y-0.5">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}

/** How to reach an outlet and where it is: its address, a phone you can call, and the coordinates (copyable) with a link that opens them in Maps. */
export function OutletContact({ outlet: o }: { outlet: Outlet }) {
  const { t } = useTranslation();
  const coordinates = `${o.latitude}, ${o.longitude}`;
  const none = <span className="font-normal text-muted-foreground">–</span>;
  return (
    <dl className="divide-y divide-border">
      <Row icon={<MapPin className="size-4" aria-hidden />} label={t('outlets.columns.address')}>
        {o.address || none}
      </Row>
      <Row icon={<Phone className="size-4" aria-hidden />} label={t('outlets.columns.phone')}>
        {o.phone ? <a href={`tel:${o.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">{o.phone}</a> : none}
      </Row>
      {o.email && (
        <Row icon={<Mail className="size-4" aria-hidden />} label={t('common.email')}>
          <a href={`mailto:${o.email}`} className="hover:underline">{o.email}</a>
        </Row>
      )}
      <Row icon={<Navigation className="size-4" aria-hidden />} label={t('outlets.detail.coordinates')}>
        <span className="flex flex-wrap items-center gap-2">
          <Badge copy={coordinates} tone="muted">{coordinates}</Badge>
          <a
            href={`https://www.google.com/maps?q=${o.latitude},${o.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            {t('outlets.detail.openMaps')} <ExternalLink className="size-3" aria-hidden />
          </a>
        </span>
      </Row>
    </dl>
  );
}
