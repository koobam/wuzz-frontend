import { Button } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { useOutletForm } from '../../hooks/use-outlet-form';

/** What the zone select tells the person: where the zone came from (the province, or the coordinate), or that it was chosen by hand, and the way back to "automatic". */
export function OutletTimezoneHint({ timezone }: { timezone: ReturnType<typeof useOutletForm>['timezone'] }) {
  const { t } = useTranslation();
  const { detected, byHand, provinceName, canDetect, useAuto } = timezone;
  const base = t('outlets.schedule.timezoneHint');
  let note: string | null = null;
  if (byHand) note = t('outlets.schedule.tzByHand');
  else if (detected?.source === 'province') note = t('outlets.schedule.tzFromProvince', { province: provinceName, zone: detected.label });
  else if (detected) note = t('outlets.schedule.tzFromCoordinates', { zone: detected.label });
  else if (!canDetect) note = t('outlets.schedule.tzNoPin');
  return (
    <span className="block space-y-1">
      <span className="block">{base}</span>
      {note && (
        <span role="status" className="block text-foreground/80">
          {note}
        </span>
      )}
      {(byHand || !detected) && canDetect && (
        <Button variant="link" onClick={useAuto}>
          {t('outlets.schedule.tzUseAuto')}
        </Button>
      )}
    </span>
  );
}
