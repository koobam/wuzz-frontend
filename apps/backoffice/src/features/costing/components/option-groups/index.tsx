import type { BomOwner, ServiceCosting } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { OptionRow } from '../option-row';

/** Step 2: the extras each option of the service's variant and modifier groups brings, each with a recipe of its own. */
export function OptionGroups({ costing, isOpen, dec, onToggle, onSaved }: { costing: ServiceCosting; isOpen: (owner: BomOwner, id: number) => boolean; dec: (s: string) => string; onToggle: (owner: BomOwner, id: number) => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const unit = costing.service.unit;
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">{t('costing.step2')}</h3>
        <p className="text-xs text-muted-foreground">{t('costing.step2Hint')}</p>
      </div>
      {costing.variant_groups.length === 0 && costing.modifier_groups.length === 0 && <p className="text-sm text-muted-foreground">{t('costing.noOptions')}</p>}
      {costing.variant_groups.map((g) => (
        <div key={`v${g.id}`} className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t('costing.variantOf', { name: g.name })}</h4>
          <ul className="space-y-2">
            {g.options.map((o) => (
              <OptionRow key={o.id} owner="variant_option" option={{ ...o, extra: o.price_delta }} unit={unit} group={g.name} open={isOpen('variant_option', o.id)} dec={dec} onToggle={() => onToggle('variant_option', o.id)} onSaved={onSaved} />
            ))}
          </ul>
        </div>
      ))}
      {costing.modifier_groups.map((g) => (
        <div key={`m${g.id}`} className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t('costing.modifierOf', { name: g.name })}</h4>
          <ul className="space-y-2">
            {g.options.map((o) => (
              <OptionRow key={o.id} owner="modifier_option" option={{ ...o, extra: o.price }} unit={unit} group={g.name} open={isOpen('modifier_option', o.id)} dec={dec} onToggle={() => onToggle('modifier_option', o.id)} onSaved={onSaved} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
