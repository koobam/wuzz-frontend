import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, FormSection } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The grid of one option row, and of the heading row above the rows, so the columns line up. `lead` is the column before the name. */
export const optionRowGrid = (lead: boolean) =>
  lead ? 'sm:grid-cols-[2.5rem_minmax(0,1fr)_11rem_5rem_2.25rem]' : 'sm:grid-cols-[minmax(0,1fr)_11rem_5rem_2.25rem]';

/**
 * The "Options" card of a group form: a heading row that names the columns once, the rows, and the button that adds one.
 * On a narrow screen the heading row is hidden and each row's fields carry their own label instead.
 */
export function OptionList({ heads, lead = false, description, canAdd, onAdd, children }: { heads: string[]; lead?: boolean; description?: string; canAdd: boolean; onAdd: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('groups.sectionOptions')} description={description} columns={1}>
      <div className="space-y-2">
        <div className={`hidden gap-3 px-1 text-xs font-medium text-muted-foreground sm:grid ${optionRowGrid(lead)}`} aria-hidden>
          {lead && <span />}
          {heads.map((h) => (
            <span key={h}>{h}</span>
          ))}
          <span />
        </div>
        {children}
      </div>
      <div>
        <Button className="inline-flex items-center gap-1.5" disabled={!canAdd} onClick={onAdd}>
          <Plus className="size-4" /> {t('groups.addOption')}
        </Button>
      </div>
    </FormSection>
  );
}
