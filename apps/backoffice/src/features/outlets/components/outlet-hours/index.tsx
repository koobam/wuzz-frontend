import { Clock, Moon, Store, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, cn } from '@wuzz/web-ui';
import { OUTLET_TIMEZONES, type Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { closesAfterMidnight, inZone, orderedWeek } from '../../utils/hours';

/** The current day and clock in the outlet's own zone, fresh every 30 seconds so the minute and the highlighted day stay right. */
function useOutletNow(timezone: Outlet['timezone']) {
  const [now, setNow] = useState(() => inZone(timezone));
  useEffect(() => {
    setNow(inZone(timezone));
    const timer = setInterval(() => setNow(inZone(timezone)), 30_000);
    return () => clearInterval(timer);
  }, [timezone]);
  return now;
}

/** The week of an outlet (today highlighted, in the outlet's zone), whether it is open right now (the server's answer), how orders reach the customer and what it sells. */
export function OutletHours({ outlet: o }: { outlet: Outlet }) {
  const { t } = useTranslation();
  const now = useOutletNow(o.timezone);
  const zone = OUTLET_TIMEZONES.find((z) => z.value === o.timezone);
  const days = orderedWeek(o.hours);

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="size-4 text-muted-foreground" aria-hidden /> {t('outlets.detail.hoursTitle')}
        </h2>
        <Badge tone={o.is_open_now ? 'good' : 'muted'}>{o.is_open_now ? t('outlets.hours.openNow') : t('outlets.hours.closed')}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge tone="info" size="xs">{zone ? `${zone.label} (${zone.offset})` : o.timezone_label}</Badge>
        <span className="tabular-nums" aria-live="off">{t('outlets.schedule.localTime', { time: now.time, zone: o.timezone_label })}</span>
      </div>

      {days.every((d) => d.open_24h && !d.closed) && <p className="text-sm font-medium">{t('outlets.schedule.everyDay24')}</p>}

      <ul className="divide-y divide-border rounded-2xl border border-border">
        {days.map((d, i) => {
          const today = i === now.weekday;
          const overnight = !d.closed && !d.open_24h && closesAfterMidnight(d.open_time, d.close_time);
          return (
            <li key={d.weekday} aria-current={today ? 'date' : undefined} className={cn('flex items-center justify-between gap-3 px-4 py-2.5 text-sm', today && 'bg-accent/60 font-medium')}>
              <span className="flex items-center gap-2">
                {t(`outlets.days.${i}`)}
                {today && <Badge tone="muted" size="xs">{t('outlets.schedule.today')}</Badge>}
              </span>
              {d.closed ? (
                <span className="text-muted-foreground">{t('outlets.schedule.off')}</span>
              ) : d.open_24h ? (
                <span className="font-medium">{t('outlets.schedule.open24')}</span>
              ) : (
                <span className="flex items-center gap-1.5 tabular-nums">
                  {overnight && <Moon className="size-3.5 text-muted-foreground" aria-label={t('outlets.schedule.afterMidnight')} />}
                  {d.open_time} – {d.close_time}
                  {overnight && <span className="text-xs text-muted-foreground">({t('outlets.schedule.plusOne')})</span>}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <dl className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Truck className="size-3.5" aria-hidden /> {t('outlets.hours.delivery')}
          </dt>
          <dd className="flex flex-wrap gap-1.5">
            {o.delivery_types.map((d) => (
              <span key={d} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{t(`outlets.delivery.${d}`)}</span>
            ))}
          </dd>
        </div>
        <div className="space-y-1.5">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Store className="size-3.5" aria-hidden /> {t('outlets.hours.category')}
          </dt>
          <dd className="text-sm font-medium">{t(`outlets.category.${o.category}`)}</dd>
        </div>
      </dl>
    </section>
  );
}
