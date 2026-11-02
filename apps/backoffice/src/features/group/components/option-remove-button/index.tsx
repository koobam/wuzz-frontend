import { Trash2 } from 'lucide-react';
import { useTranslation } from '@/core/utils/i18n';

export function OptionRemoveButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={t('groups.removeOption')}
      title={t('groups.removeOption')}
      className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent disabled:opacity-40"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
