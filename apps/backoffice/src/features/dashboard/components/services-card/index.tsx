import { Link } from '@tanstack/react-router';
import { rupiah } from '@wuzz/web-ui';
import type { Service } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

const FADE = 'linear-gradient(to right, transparent, black 1.25rem, black calc(100% - 1.25rem), transparent)';

/** The services as a row of cards that scrolls sideways. */
export function ServicesCard({ services }: { services?: Service[] }) {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card p-5">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-semibold">{t('dashboard.services')}</h2>
        <Link to="/services" className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent">
          {t('dashboard.manage')}
        </Link>
      </div>
      <div
        // Bleeds to the card's edges (the card's own padding is the scroll padding) and fades out at both
        // ends, so cards leave at the border instead of being sliced inside it.
        className="-mx-5 flex min-h-0 flex-1 snap-x snap-mandatory scroll-px-5 items-stretch gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: FADE, WebkitMaskImage: FADE }}
      >
        {services?.map((s, i) => (
          <div
            key={s.id}
            className={`flex min-h-24 w-44 shrink-0 snap-start flex-col justify-between rounded-2xl p-3 ${i % 2 === 0 ? 'bg-ink text-background' : 'bg-linear-to-br from-[#f8895c] to-[#e2483d] text-white'}`}
          >
            <span className="w-fit rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{s.active ? t('common.active') : t('dashboard.inactive')}</span>
            <div>
              <div className="truncate text-sm font-medium" title={s.name}>{s.name}</div>
              <div className="text-xs opacity-80">{t('dashboard.perUnit', { price: rupiah(s.price), unit: s.unit })}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
