import { useTranslation } from '@/core/utils/i18n';

/** One option of a group as a pill tag: its name, "default" if it is the one pre-selected, and what it adds to the price. A switched-off option is struck through. */
export function OptionPill({ name, hint, isDefault = false, off = false }: { name: string; hint?: string; isDefault?: boolean; off?: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs whitespace-nowrap ${off ? 'text-muted-foreground line-through' : ''}`}>
      <span className="font-medium">{name}</span>
      {isDefault && <span className="rounded-full bg-ink px-1.5 py-px text-[10px] text-background no-underline">{t('groups.default')}</span>}
      {hint && <span className="text-muted-foreground">{hint}</span>}
    </span>
  );
}
