import { CatalogIcon } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { Category } from '@/core/pos/types';

const CHIP = 'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors';
const chip = (on: boolean) => `${CHIP} ${on ? 'border-transparent bg-ink text-background' : 'border-border bg-card hover:bg-accent'}`;

/** "All" and one chip per category, each with how many services it holds. */
export function CategoryTabs({ categories, value, total, countIn, onChange }: { categories: Category[]; value: number | 'all'; total: number; countIn: (id: number) => number; onChange: (v: number | 'all') => void }) {
  const { t } = useTranslation();
  return (
    <div role="tablist" aria-label={t('newOrder.categories')} className="flex gap-2 overflow-x-auto pb-1">
      <button type="button" role="tab" aria-selected={value === 'all'} onClick={() => onChange('all')} className={chip(value === 'all')}>
        {t('newOrder.all')}
        <span className="text-xs opacity-70">{total}</span>
      </button>
      {categories.map((c) => (
        <button key={c.id} type="button" role="tab" aria-selected={value === c.id} onClick={() => onChange(c.id)} className={chip(value === c.id)}>
          <CatalogIcon name={c.icon} />
          {c.name}
          <span className="text-xs opacity-70">{countIn(c.id)}</span>
        </button>
      ))}
    </div>
  );
}
