import { ChevronDown } from 'lucide-react';
import { rupiah } from '@wuzz/web-ui';
import type { BomOwner, Cost } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { BomEditor } from '../bom-editor';

/** One option of a variant or modifier group: what it adds to the price and to the material cost; click to set its recipe. */
export function OptionRow({ owner, option, unit, group, open, dec, onToggle, onSaved }: {
  owner: BomOwner;
  option: { id: number; name: string; extra: number } & Cost;
  unit: string;
  group: string;
  open: boolean;
  dec: (s: string) => string;
  onToggle: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const hasRecipe = Number(option.per_unit) > 0 || Number(option.per_line) > 0;
  return (
    <li className="rounded-2xl border border-border">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-accent/50">
        <span>
          <span className="block font-medium">{option.name}</span>
          <span className="block text-xs text-muted-foreground">
            {[
              option.extra > 0 ? t('costing.extraPrice', { price: rupiah(option.extra) }) : '',
              hasRecipe
                ? [Number(option.per_unit) > 0 ? t('costing.extraCost', { cost: dec(option.per_unit), unit }) : '', Number(option.per_line) > 0 ? t('costing.extraCostLine', { cost: dec(option.per_line) }) : ''].filter(Boolean).join(' · ')
                : t('costing.noRecipe'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {open ? t('costing.hide') : t('costing.open')}
          <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        <div className="border-t border-border p-4">
          <BomEditor key={`${owner}:${option.id}`} owner={owner} id={option.id} title={t('costing.bom.titleOption', { name: `${group} / ${option.name}` })} unit={unit} onSaved={onSaved} />
        </div>
      )}
    </li>
  );
}
