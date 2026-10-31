import { Ban, Boxes, ExternalLink, Globe, Power, PowerOff, Smartphone, Store } from 'lucide-react';
import { Controller, useWatch } from 'react-hook-form';
import { Badge, Button, ChoiceCard, DateTimeField, ErrorText, Field, MultiSelect, Textarea, TextField } from '@wuzz/web-ui';
import type { Banner, BannerTargetType } from '@/core/api';
import { firstError } from '@/core/utils/form';
import { useTranslation } from '@/core/utils/i18n';
import { usePublishFormActions } from '@/features/shell/components/form-header-actions';
import { useBannerForm } from '../../hooks/use-banner-form';
import { liveState, LIVE_TONE, scheduleSentence, zoneName } from '../../utils/banner-display';
import { fromLocalInput, MAX_NOTES, MAX_TITLE } from '../../utils/banner-form.schema';
import { BannerImage } from '../banner-image';
import { BannerTargetField } from '../banner-target-field';

const SECTION = 'space-y-4 rounded-3xl border border-border bg-card p-5';
const TARGET_ICONS: Record<BannerTargetType, typeof Ban> = { none: Ban, service: Boxes, outlet: Store, screen: Smartphone, external: ExternalLink };
const TARGETS: BannerTargetType[] = ['none', 'service', 'outlet', 'screen', 'external'];

/** The form of the create / edit page that makes or edits a banner: its text, picture, where a tap goes, when it shows, at which outlets, and whether it is published. */
export function BannerForm({ banner, onSaved, onCancel }: { banner?: Banner; onSaved: (saved: Banner) => void; onCancel: () => void }) {
  const { t, i18n } = useTranslation();
  const f = useBannerForm(banner, onSaved);
  usePublishFormActions({ formId: 'banner-form', saving: f.saving || f.uploading, editing: !!banner, onCancel });
  const { register, control, formState, setValue } = f.form;
  const { errors } = formState;
  const message = firstError(errors);

  const title = useWatch({ control, name: 'title' });
  const imageUrl = useWatch({ control, name: 'image_url' });
  const targetType = useWatch({ control, name: 'target_type' });
  const targetValue = useWatch({ control, name: 'target_value' });
  const startsAt = useWatch({ control, name: 'starts_at' });
  const endsAt = useWatch({ control, name: 'ends_at' });
  const status = useWatch({ control, name: 'status' });
  const scope = useWatch({ control, name: 'scope' });

  const startIso = fromLocalInput(startsAt);
  const endIso = fromLocalInput(endsAt);
  const now = Date.now();
  const isLiveNow = status === 'active' && (!startIso || new Date(startIso).getTime() <= now) && (!endIso || new Date(endIso).getTime() > now);
  const preview = liveState({ is_live: isLiveNow, status, starts_at: startIso, ends_at: endIso }, now);

  const labels = {
    pickDate: t('banners.form.pickDate'),
    timePlaceholder: t('banners.form.timePlaceholder'),
    clear: t('banners.form.clearDate'),
    timeFirst: t('banners.form.timeFirst'),
    hour: t('banners.form.hour'),
    minute: t('banners.form.minute'),
    calendar: t('banners.form.calendar'),
  };

  return (
    <form id="banner-form" noValidate className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]" onSubmit={f.submit}>
      <div className="min-w-0 space-y-5">
        <section className={SECTION}>
          <h2 className="text-sm font-semibold">{t('banners.form.sectionInfo')}</h2>
          <div className="grid gap-4">
            <TextField label={t('banners.form.title')} placeholder={t('banners.form.titlePlaceholder')} required maxLength={MAX_TITLE} error={errors.title?.message} {...register('title')} />
            <Field label={t('banners.form.internalNotes')} hint={t('banners.form.internalNotesHint')} error={errors.internal_notes?.message}>
              {(id) => <Textarea id={id} maxLength={MAX_NOTES} placeholder={t('banners.form.notesPlaceholder')} invalid={!!errors.internal_notes} {...register('internal_notes')} />}
            </Field>
          </div>
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('banners.form.sectionTarget')}</h2>
            <p className="text-xs text-muted-foreground">{t('banners.form.targetDescription')}</p>
          </div>
          <div role="radiogroup" aria-label={t('banners.form.sectionTarget')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {TARGETS.map((kind) => {
              const Icon = TARGET_ICONS[kind];
              return (
                <ChoiceCard
                  key={kind}
                  type="radio"
                  checked={targetType === kind}
                  onChange={() => {
                    setValue('target_type', kind, { shouldDirty: true });
                    setValue('target_value', '', { shouldDirty: true, shouldValidate: formState.isSubmitted });
                  }}
                  icon={<Icon className="size-5" aria-hidden />}
                  title={t(`banners.target.${kind}`)}
                  description={t(`banners.form.targetDescriptions.${kind}`)}
                />
              );
            })}
          </div>
          <BannerTargetField
            type={targetType}
            value={targetValue}
            onChange={(v) => setValue('target_value', v, { shouldDirty: true, shouldValidate: true })}
            services={f.services}
            outlets={f.outlets}
            screens={f.screens}
            error={errors.target_value?.message}
            loading={f.pickersLoading}
          />
          <ErrorText error={f.pickersError} />
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('banners.form.sectionSchedule')}</h2>
            <p className="text-xs text-muted-foreground">{t('banners.form.scheduleDescription', { zone: zoneName() })}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="starts_at"
              render={({ field }) => (
                <Field label={t('banners.form.startsAt')} hint={t('banners.form.startsAtHint')} error={errors.starts_at?.message}>
                  {(id) => <DateTimeField id={id} value={field.value} onChange={field.onChange} onBlur={field.onBlur} language={i18n.language} defaultTime="00:00" labels={labels} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="ends_at"
              render={({ field }) => (
                <Field label={t('banners.form.endsAt')} hint={t('banners.form.endsAtHint')} error={errors.ends_at?.message}>
                  {(id) => <DateTimeField id={id} value={field.value} onChange={field.onChange} onBlur={field.onBlur} language={i18n.language} defaultTime="23:59" invalid={!!errors.ends_at} labels={labels} />}
                </Field>
              )}
            />
          </div>
          <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm" aria-live="polite">{scheduleSentence(startsAt, endsAt, t, i18n.language)}</p>
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('banners.form.sectionOutlets')}</h2>
            <p className="text-xs text-muted-foreground">{t('banners.form.outletsDescription')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceCard type="radio" checked={scope === 'all'} onChange={() => setValue('scope', 'all', { shouldDirty: true })} icon={<Globe className="size-5" aria-hidden />} title={t('banners.form.scopeAll')} description={t('banners.form.scopeAllDescription')} />
            <ChoiceCard type="radio" checked={scope === 'some'} onChange={() => setValue('scope', 'some', { shouldDirty: true })} icon={<Store className="size-5" aria-hidden />} title={t('banners.form.scopeSome')} description={t('banners.form.scopeSomeDescription')} />
          </div>
          {scope === 'some' && (
            <Controller
              control={control}
              name="outlet_ids"
              render={({ field }) => (
                <Field label={t('banners.form.outletsPick')} error={errors.outlet_ids?.message}>
                  {(id) => (
                    <MultiSelect
                      inputId={id}
                      ariaLabel={t('banners.form.outletsPick')}
                      placeholder={t('banners.form.outletsPlaceholder')}
                      noOptionsText={t('banners.form.outletsNone')}
                      loading={f.pickersLoading}
                      value={field.value}
                      onChange={field.onChange}
                      options={f.outlets.map((o) => ({ value: o.id, label: o.name }))}
                    />
                  )}
                </Field>
              )}
            />
          )}
        </section>
      </div>

      <div className="min-w-0 space-y-5 lg:sticky lg:top-24">
        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('banners.form.sectionImage')}</h2>
            <p className="text-xs text-muted-foreground">{t('banners.form.imageDescription')}</p>
          </div>
          <Controller
            control={control}
            name="image_url"
            render={({ field }) => <BannerImage value={field.value} onChange={(url) => field.onChange(url)} error={errors.image_url?.message} title={title} onUploadingChange={f.setUploading} />}
          />
        </section>

        <section className={SECTION}>
          <h2 className="text-sm font-semibold">{t('banners.form.sectionStatus')}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ChoiceCard type="radio" checked={status === 'active'} onChange={() => setValue('status', 'active', { shouldDirty: true, shouldValidate: formState.isSubmitted })} icon={<Power className="size-5" aria-hidden />} title={t('banners.form.statusActive')} description={t('banners.form.statusActiveDescription')} />
            <ChoiceCard type="radio" checked={status === 'inactive'} onChange={() => setValue('status', 'inactive', { shouldDirty: true, shouldValidate: formState.isSubmitted })} icon={<PowerOff className="size-5" aria-hidden />} title={t('banners.form.statusInactive')} description={t('banners.form.statusInactiveDescription')} />
          </div>
          {status === 'active' && !imageUrl && <p role="alert" className="text-xs text-destructive">{t('banners.form.imageNeededToActivate')}</p>}
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {t('banners.form.afterSaving')} <Badge tone={LIVE_TONE[preview]} size="sm">{t(`banners.live.${preview}`)}</Badge>
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" disabled={f.saving || f.uploading}>{banner ? t('common.save') : t('common.create')}</Button>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
        </div>
        {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
        <ErrorText error={f.error} />
      </div>
    </form>
  );
}
