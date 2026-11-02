import { Minus, Plus } from 'lucide-react';
import { CatalogIcon, rupiah } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { CatalogItem } from '@/core/pos/types';
import { customizable } from '../../utils/cart';
import { stepOf } from '../../utils/pricing';

const STEP_BTN = 'grid size-9 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-40';

/**
 * One service on the catalog: a plain one is counted from its card (− 1 +), one with variants or modifiers opens its sheet.
 * `qty` is how much of it is on the order already; a card with something on the order turns dark.
 */
export function ServiceCard({ item, qty, onSet, onChoose }: { item: CatalogItem; qty: number; onSet: (value: number) => void; onChoose: () => void }) {
  const { t } = useTranslation();
  const custom = customizable(item);
  const picked = qty > 0;
  const step = stepOf(item);
  return (
    <div
      onClick={custom ? onChoose : undefined}
      className={`flex flex-col justify-between gap-5 rounded-3xl border p-4 transition-colors ${custom ? 'cursor-pointer ' : ''}${picked ? 'border-transparent bg-ink text-background' : 'border-border bg-card'}`}
    >
      <div className="flex items-start gap-3">
        <CatalogIcon name={item.icon} size={64} />
        <div className="min-w-0">
          <div className="font-medium">{item.name}</div>
          <div className={`text-sm ${picked ? 'opacity-80' : 'text-muted-foreground'}`}>
            {rupiah(item.price)} / {item.unit}
          </div>
        </div>
      </div>
      {custom ? (
        <div className="flex items-center justify-between gap-2">
          <span className="pl-2 text-base font-medium tabular-nums">{picked ? `× ${qty}` : ''}</span>
          <button type="button" onClick={onChoose} aria-label={t('newOrder.more', { name: item.name })} className={`${STEP_BTN} ${picked ? 'bg-white/20 hover:bg-white/30' : 'bg-ink text-background'}`}>
            <Plus className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button type="button" disabled={!picked} onClick={() => onSet(qty - step)} aria-label={t('newOrder.less', { name: item.name })} className={`${STEP_BTN} ${picked ? 'bg-white/20 hover:bg-white/30' : 'bg-muted'}`}>
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            min={0}
            step={step}
            value={qty || ''}
            onChange={(e) => onSet(Number(e.target.value) || 0)}
            placeholder="0"
            aria-label={t('newOrder.quantity', { name: item.name })}
            className={`min-w-0 flex-1 rounded-full bg-transparent px-2 py-1.5 text-center text-base font-medium outline-none ${picked ? 'placeholder:text-background/50' : 'placeholder:text-muted-foreground'}`}
          />
          <button type="button" onClick={() => onSet(qty + step)} aria-label={t('newOrder.more', { name: item.name })} className={`${STEP_BTN} ${picked ? 'bg-white/20 hover:bg-white/30' : 'bg-ink text-background'}`}>
            <Plus className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
