import { History } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@wuzz/web-ui';
import type { ActivityEntity } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityModal } from '../activity-modal';

/**
 * "View activity": a button for the header of a page that opens the log of what it shows. A list page gives the kind of
 * thing (`outlet`); a record's page also gives its id. One kind per button.
 */
export function ActivityButton({ entityType, entityId, label }: { entityType: ActivityEntity; entityId?: string | number; label?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const title = label ?? t(`activity.entityTitle.${entityType}`);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5">
        <History className="size-4" aria-hidden /> {t('activity.view')}
      </Button>
      <ActivityModal open={open} onClose={() => setOpen(false)} title={title} entityType={entityType} entityId={entityId === undefined ? undefined : String(entityId)} />
    </>
  );
}
