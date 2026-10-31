import { Link } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { rupiah } from '@wuzz/web-ui';
import type { Area, Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

// The map library is heavy; it loads when the dashboard does, not with every page.
const OutletsMap = lazy(() => import('../outlets-map'));

/** One card, two sections: the money on top, and below it the outlets on a map that fills the rest. */
export function RevenueCard({ revenue, fulfilled, outlets, shown, onAreaChange }: { revenue?: number; fulfilled: number; outlets?: Outlet[]; shown: Outlet[]; onAreaChange: (area: Area) => void }) {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-card">
      <div className="p-5">
        <div className="text-sm text-muted-foreground">{t('dashboard.revenue')}</div>
        <div className="mt-1 text-4xl font-semibold tracking-tight">{revenue !== undefined ? rupiah(revenue) : '–'}</div>
        <div className="mt-1 text-xs text-muted-foreground">{t('dashboard.revenueNote', { count: fulfilled })}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to="/orders" className="rounded-full bg-ink px-4 py-2.5 text-center text-sm font-medium text-background">
            {t('dashboard.viewOrders')}
          </Link>
          <Link to="/users" className="rounded-full bg-muted px-4 py-2.5 text-center text-sm font-medium">
            {t('dashboard.viewUsers')}
          </Link>
        </div>
      </div>

      <div className="relative isolate min-h-64 flex-1 overflow-hidden border-t border-border">
        <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-muted" />}>
          {outlets ? <OutletsMap all={outlets} shown={shown} onAreaChange={onAreaChange} /> : <div className="absolute inset-0 animate-pulse bg-muted" />}
        </Suspense>
        <div className="pointer-events-none absolute top-3 left-3 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
          <span className="font-medium">{t('dashboard.outlets')}</span>
          <span className="text-muted-foreground"> | {t('dashboard.inArea', { shown: shown.length, total: outlets?.length ?? 0 })}</span>
        </div>
      </div>
    </section>
  );
}
