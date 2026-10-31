import { Button } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** Previous and next page, for a list the server pages. */
export function Pager({ prev, next }: { prev: { disabled: boolean; onClick: () => void }; next: { disabled: boolean; onClick: () => void } }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
      <Button {...prev}>{t('common.prev')}</Button>
      <Button {...next}>{t('common.next')}</Button>
    </div>
  );
}
