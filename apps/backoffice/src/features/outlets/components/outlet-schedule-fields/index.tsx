import { CopyPlus, Moon } from 'lucide-react';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { Button, Field, FormSection, Segmented, Select, TimePicker } from '@wuzz/web-ui';
import { OUTLET_TIMEZONES } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { closesAfterMidnight, DEFAULT_CLOSE, DEFAULT_OPEN, dayMode, week, week24 } from '../../utils/hours';
import type { useOutletForm } from '../../hooks/use-outlet-form';
import type { OutletValues } from '../../utils/outlet-form.schema';
import { OutletTimezoneHint } from '../outlet-timezone-hint';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
/** Quick choices in the time pickers' popover. */
const PRESETS = ['08:00', '12:00', '17:00', '22:00'];
/**
 * The week is a table that adapts to the width of ITS OWN card (a container query, not the screen): wide enough, each day is
 * one line (day, status, opening time – closing time, the dash turning into a moon when it closes after midnight); narrower,
 * a day is two lines (day and status, then the two pickers side by side, or stacked when even that does not fit). The header
 * and the rows share one set of columns, and a time picker never gets narrower than 9.5rem, so nothing overlaps.
 */
/** Fixed tracks, shared by the header and every row: 14rem holds the widest status control ("Open | Closed | 24 hours"). The card needs 45rem for this row. */
const WIDE = '@min-[45rem]:grid-cols-[4.5rem_14rem_minmax(9.5rem,1fr)_1.25rem_minmax(9.5rem,1fr)]';

/**
 * The form card of when an outlet is open: the zone its times are written in with the quick settings next to it, and the
 * seven days of the week, each open (from and to, a closing time before the opening one means after midnight), closed or
 * open 24 hours.
 */
export function OutletScheduleFields({ form, timezone }: { form: UseFormReturn<OutletValues>; timezone?: ReturnType<typeof useOutletForm>['timezone'] }) {
  const { t } = useTranslation();
  const { control, setValue, formState } = form;
  const days = useWatch({ control, name: 'hours' });
  const errors = formState.errors.hours;
  const set = (next: OutletValues['hours']) => setValue('hours', next, { shouldValidate: true, shouldDirty: true });
  const dayName = (i: number) => t(`outlets.days.${i}`);
  // Problems are listed once under the week, not inside the rows, so an error never makes a row taller.
  const rowErrors = days.flatMap((d, i) => {
    const message = !d.closed && !d.open_24h ? (errors?.[i]?.open_time?.message ?? errors?.[i]?.close_time?.message) : undefined;
    return message ? [{ day: dayName(i), message }] : [];
  });

  return (
    <FormSection title={t('outlets.schedule.title')} description={t('outlets.schedule.description')} columns={1}>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <Field label={t('outlets.schedule.timezone')} hint={timezone ? <OutletTimezoneHint timezone={timezone} /> : t('outlets.schedule.timezoneHint')}>
              {() => (
                <Select
                  ariaLabel={t('outlets.schedule.timezone')}
                  className="w-full"
                  value={field.value}
                  onChange={(v) => (timezone ? timezone.setByHand(v) : field.onChange(v))}
                  options={OUTLET_TIMEZONES.map((z) => ({ value: z.value, label: `${z.label} — ${z.value.replace('Asia/', '')} (${z.offset})` }))}
                />
              )}
            </Field>
          )}
        />
        <Field label={t('outlets.schedule.quick')} hint={t('outlets.schedule.quickHint')}>
          {() => (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => set(week())}>{t('outlets.schedule.presetDaily', { open: DEFAULT_OPEN, close: DEFAULT_CLOSE })}</Button>
              <Button size="sm" onClick={() => set(week(DEFAULT_OPEN, DEFAULT_CLOSE, [5, 6]))}>{t('outlets.schedule.presetWeekdays')}</Button>
              <Button size="sm" onClick={() => set(week24())}>{t('outlets.schedule.presetAllDay')}</Button>
              <Button size="sm" onClick={() => set(days.map((x) => ({ ...x, closed: days[0]!.closed, open_24h: days[0]!.open_24h, open_time: days[0]!.open_time, close_time: days[0]!.close_time })))}>
                <CopyPlus className="mr-1.5 inline size-3.5 align-[-2px]" aria-hidden />
                {t('outlets.schedule.copyMonday')}
              </Button>
            </div>
          )}
        </Field>
      </div>

      <div className="@container">
        <div role="group" aria-label={t('outlets.schedule.title')} className="divide-y divide-border rounded-2xl border border-border">
          <div className={`hidden items-center gap-x-4 bg-muted/50 px-4 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground @min-[45rem]:grid ${WIDE}`}>
            <span>{t('outlets.schedule.day')}</span>
            <span>{t('outlets.schedule.status')}</span>
            <span>{t('outlets.form.openTime')}</span>
            <span aria-hidden />
            <span>{t('outlets.form.closeTime')}</span>
          </div>
          {days.map((d, i) => {
            const overnight = !d.closed && !d.open_24h && TIME.test(d.open_time) && TIME.test(d.close_time) && closesAfterMidnight(d.open_time, d.close_time);
            return (
              <div key={d.weekday} className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-2 ${WIDE}`}>
                <span className="min-w-0 truncate text-sm font-medium">{dayName(i)}</span>
                <Segmented
                  ariaLabel={t('outlets.schedule.closedDay', { day: dayName(i) })}
                  value={dayMode(d)}
                  onChange={(next) => {
                    setValue(`hours.${i}.closed`, next === 'closed', { shouldValidate: true, shouldDirty: true });
                    setValue(`hours.${i}.open_24h`, next === 'open24', { shouldValidate: true, shouldDirty: true });
                    // Back to a normal day: put the times back (a day that came from the server as 24 hours or closed has none to restore).
                    if (next === 'open') {
                      if (!d.open_time || d.open_time === '00:00') setValue(`hours.${i}.open_time`, DEFAULT_OPEN, { shouldValidate: true });
                      if (!d.close_time || d.close_time === '00:00') setValue(`hours.${i}.close_time`, DEFAULT_CLOSE, { shouldValidate: true });
                    }
                  }}
                  options={[
                    { value: 'open', label: t('outlets.schedule.open') },
                    { value: 'closed', label: t('outlets.schedule.closed') },
                    { value: 'open24', label: t('outlets.schedule.open24') },
                  ]}
                  className="justify-self-end @min-[45rem]:justify-self-start"
                />
                {/* The two pickers: under the day in a narrow card (stacked when even two do not fit), spread over the row's own columns in a wide one. */}
                <div className="col-span-2 grid grid-cols-[minmax(9.5rem,1fr)_auto_minmax(9.5rem,1fr)] items-center gap-x-3 gap-y-2 @max-[24rem]:grid-cols-1 @min-[45rem]:contents">
                  <div className="min-w-0 space-y-1">
                    <span className="sr-only">{t('outlets.form.openTime')}</span>
                            <Controller
                              control={control}
                              name={`hours.${i}.open_time`}
                              render={({ field }) => (
                                <TimePicker
                                  value={d.open_24h ? '' : field.value}
                                  onChange={(v) => {
                                    field.onChange(v);
                                    void form.trigger(`hours.${i}.close_time`);
                                  }}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  disabled={d.closed || d.open_24h}
                                  disabledHint={d.open_24h ? t('outlets.schedule.open24') : t('outlets.schedule.closed')}
                                  invalid={!d.closed && !d.open_24h && !!errors?.[i]?.open_time}
                                  presets={PRESETS}
                                  ariaLabel={`${dayName(i)} — ${t('outlets.form.openTime')}`}
                                  popoverLabel={t('outlets.schedule.pickOpen', { day: dayName(i) })}
                                  hourLabel={t('outlets.schedule.hour')}
                                  minuteLabel={t('outlets.schedule.minute')}
                                  placeholder={d.open_24h ? t('outlets.schedule.open24') : t('outlets.schedule.timePlaceholder')}
                                />
                              )}
                            />
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center text-muted-foreground @max-[24rem]:hidden" title={overnight ? t('outlets.schedule.afterMidnight') : undefined} role={overnight ? 'img' : undefined} aria-label={overnight ? t('outlets.schedule.afterMidnight') : undefined} aria-hidden={overnight ? undefined : true}>
                    {overnight ? <Moon className="size-4" /> : '–'}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <span className="sr-only">{t('outlets.form.closeTime')}</span>
                            <Controller
                              control={control}
                              name={`hours.${i}.close_time`}
                              render={({ field }) => (
                                <TimePicker
                                  value={d.open_24h ? '' : field.value}
                                  onChange={(v) => {
                                    field.onChange(v);
                                    void form.trigger(`hours.${i}.close_time`);
                                  }}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  disabled={d.closed || d.open_24h}
                                  disabledHint={d.open_24h ? t('outlets.schedule.open24') : t('outlets.schedule.closed')}
                                  invalid={!d.closed && !d.open_24h && !!errors?.[i]?.close_time}
                                  presets={PRESETS}
                                  ariaLabel={`${dayName(i)} — ${t('outlets.form.closeTime')}`}
                                  popoverLabel={t('outlets.schedule.pickClose', { day: dayName(i) })}
                                  hourLabel={t('outlets.schedule.hour')}
                                  minuteLabel={t('outlets.schedule.minute')}
                                  placeholder={d.open_24h ? t('outlets.schedule.open24') : t('outlets.schedule.timePlaceholder')}
                                />
                              )}
                            />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {rowErrors.length > 0 && (
        <ul role="alert" className="space-y-0.5 text-xs text-destructive">
          {rowErrors.map((e) => (
            <li key={e.day}>
              {e.day}: {e.message}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{t('outlets.form.closeHint')}</p>
    </FormSection>
  );
}
