import { Banknote, Globe, KeyRound, Percent, Power, PowerOff, Shuffle, Store, Tags, Users } from 'lucide-react';
import { Controller, useWatch } from 'react-hook-form';
import { Badge, Button, ChoiceCard, DateTimeField, ErrorText, Field, Input, MultiSelect, Textarea, TextField, rupiah } from '@wuzz/web-ui';
import { VOUCHER_COLORS, type Voucher } from '@/core/api';
import { firstError } from '@/core/utils/form';
import { useTranslation } from '@/core/utils/i18n';
import { BannerImage } from '@/features/banners/components/banner-image';
import { usePublishFormActions } from '@/features/shell/components/form-header-actions';
import { useVoucherForm } from '../../hooks/use-voucher-form';
import { liveState, LIVE_TONE, randomCode, scheduleSentence, zoneName } from '../../utils/voucher-display';
import { fromLocalInput, MAX_CODE, MAX_DESCRIPTION, MAX_NOTES, MAX_TITLE, VOUCHER_RATIO } from '../../utils/voucher-form.schema';
import { VoucherStub } from '../voucher-stub';

const SECTION = 'space-y-4 rounded-3xl border border-border bg-card p-5';

/** What the number typed in an amount field comes to in rupiah, for the hint under it ("" until it is a whole number). */
const asRupiah = (v: string) => (/^\d+$/.test(v.trim()) && Number(v) > 0 ? rupiah(Number(v)) : undefined);

/** The form of the create / edit page that makes or edits a voucher: its text and colour, the discount, how it is claimed, when and where it can be used, and whether it is published. */
export function VoucherForm({ voucher, onSaved, onCancel }: { voucher?: Voucher; onSaved: (saved: Voucher) => void; onCancel: () => void }) {
  const { t, i18n } = useTranslation();
  const f = useVoucherForm(voucher, onSaved);
  usePublishFormActions({ formId: 'voucher-form', saving: f.saving || f.uploading, editing: !!voucher, onCancel });
  const { register, control, formState, setValue } = f.form;
  const { errors } = formState;
  const message = firstError(errors);

  const w = useWatch({ control });
  const startIso = fromLocalInput(w.starts_at ?? '');
  const endIso = fromLocalInput(w.ends_at ?? '');
  const now = Date.now();
  const status = w.status ?? 'inactive';
  const isLiveNow = status === 'active' && (!startIso || new Date(startIso).getTime() <= now) && (!endIso || new Date(endIso).getTime() > now);
  const preview = liveState({ is_live: isLiveNow, status, starts_at: startIso, ends_at: endIso }, now);
  const percentage = w.discount_type === 'percentage';
  const coded = w.type === 'code';

  const labels = {
    pickDate: t('banners.form.pickDate'),
    timePlaceholder: t('banners.form.timePlaceholder'),
    clear: t('banners.form.clearDate'),
    timeFirst: t('banners.form.timeFirst'),
    hour: t('banners.form.hour'),
    minute: t('banners.form.minute'),
    calendar: t('banners.form.calendar'),
  };

  const stub = {
    title: w.title ?? '',
    color: w.color ?? '',
    discount_type: w.discount_type ?? 'percentage',
    value: /^\d+$/.test((w.value ?? '').trim()) ? Number(w.value) : 0,
    min_spend: /^\d+$/.test((w.min_spend ?? '').trim()) ? Number(w.min_spend) : 0,
    code: w.code ?? '',
    type: w.type ?? 'public',
  } as const;

  return (
    <form id="voucher-form" noValidate className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]" onSubmit={f.submit}>
      <div className="min-w-0 space-y-5">
        <section className={SECTION}>
          <h2 className="text-sm font-semibold">{t('vouchers.form.sectionInfo')}</h2>
          <div className="grid gap-4">
            <TextField label={t('vouchers.form.title')} placeholder={t('vouchers.form.titlePlaceholder')} required maxLength={MAX_TITLE} error={errors.title?.message} {...register('title')} />
            <Field label={t('vouchers.form.description')} hint={t('vouchers.form.descriptionHint')} error={errors.description?.message}>
              {(id) => <Textarea id={id} maxLength={MAX_DESCRIPTION} placeholder={t('vouchers.form.descriptionPlaceholder')} invalid={!!errors.description} {...register('description')} />}
            </Field>
            <Field label={t('vouchers.form.internalNotes')} hint={t('vouchers.form.internalNotesHint')} error={errors.internal_notes?.message}>
              {(id) => <Textarea id={id} maxLength={MAX_NOTES} placeholder={t('vouchers.form.notesPlaceholder')} invalid={!!errors.internal_notes} {...register('internal_notes')} />}
            </Field>
          </div>
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('vouchers.form.sectionDiscount')}</h2>
            <p className="text-xs text-muted-foreground">{t('vouchers.form.discountDescription')}</p>
          </div>
          <div role="radiogroup" aria-label={t('vouchers.form.sectionDiscount')} className="grid gap-3 sm:grid-cols-2">
            <ChoiceCard type="radio" checked={percentage} onChange={() => setValue('discount_type', 'percentage', { shouldDirty: true, shouldValidate: formState.isSubmitted })} icon={<Percent className="size-5" aria-hidden />} title={t('vouchers.discount.percentage')} description={t('vouchers.form.percentageDescription')} />
            <ChoiceCard type="radio" checked={!percentage} onChange={() => setValue('discount_type', 'amount', { shouldDirty: true, shouldValidate: formState.isSubmitted })} icon={<Banknote className="size-5" aria-hidden />} title={t('vouchers.discount.amount')} description={t('vouchers.form.amountDescription')} />
          </div>
          <div className={`grid gap-4 ${percentage ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
            <TextField
              label={percentage ? t('vouchers.form.valuePercent') : t('vouchers.form.valueAmount')}
              placeholder={percentage ? t('vouchers.form.valuePercentPlaceholder') : t('vouchers.form.valueAmountPlaceholder')}
              inputMode="numeric"
              required
              hint={percentage ? t('vouchers.form.valuePercentHint') : (asRupiah(w.value ?? '') ?? t('vouchers.form.amountHint'))}
              error={errors.value?.message}
              {...register('value')}
            />
            {percentage && <TextField label={t('vouchers.form.maxDiscount')} placeholder={t('vouchers.form.maxDiscountPlaceholder')} inputMode="numeric" hint={asRupiah(w.max_discount ?? '') ?? t('vouchers.form.maxDiscountHint')} error={errors.max_discount?.message} {...register('max_discount')} />}
            <TextField label={t('vouchers.form.minSpend')} placeholder={t('vouchers.form.minSpendPlaceholder')} inputMode="numeric" hint={asRupiah(w.min_spend ?? '') ?? t('vouchers.form.minSpendHint')} error={errors.min_spend?.message} {...register('min_spend')} />
            <TextField label={t('vouchers.form.usageLimit')} placeholder="1" inputMode="numeric" required hint={t('vouchers.form.usageLimitHint')} error={errors.usage_limit?.message} {...register('usage_limit')} />
          </div>
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('vouchers.form.sectionClaim')}</h2>
            <p className="text-xs text-muted-foreground">{t('vouchers.form.claimDescription')}</p>
          </div>
          <div role="radiogroup" aria-label={t('vouchers.form.sectionClaim')} className="grid gap-3 sm:grid-cols-2">
            <ChoiceCard type="radio" checked={!coded} onChange={() => setValue('type', 'public', { shouldDirty: true, shouldValidate: formState.isSubmitted })} icon={<Users className="size-5" aria-hidden />} title={t('vouchers.type.public')} description={t('vouchers.form.publicDescription')} />
            <ChoiceCard type="radio" checked={coded} onChange={() => setValue('type', 'code', { shouldDirty: true, shouldValidate: formState.isSubmitted })} icon={<KeyRound className="size-5" aria-hidden />} title={t('vouchers.type.code')} description={t('vouchers.form.codeDescription')} />
          </div>
          {coded && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <Field label={t('vouchers.form.code')} required hint={t('vouchers.form.codeHint', { min: 4, max: MAX_CODE })} error={errors.code?.message}>
                    {(id) => (
                      <div className="flex items-center gap-2">
                        <Input
                          id={id}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          onBlur={field.onBlur}
                          maxLength={MAX_CODE}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={t('vouchers.form.codePlaceholder')}
                          invalid={!!errors.code}
                          className="min-w-0 flex-1 font-mono tracking-wider"
                        />
                        <Button className="inline-flex shrink-0 items-center gap-1.5" onClick={() => field.onChange(randomCode())} title={t('vouchers.form.generate')}>
                          <Shuffle className="size-4" aria-hidden /> {t('vouchers.form.generate')}
                        </Button>
                      </div>
                    )}
                  </Field>
                )}
              />
              <TextField label={t('vouchers.form.maxClaims')} placeholder={t('vouchers.form.maxClaimsPlaceholder')} inputMode="numeric" hint={t('vouchers.form.maxClaimsHint')} error={errors.max_claims?.message} {...register('max_claims')} />
            </div>
          )}
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('vouchers.form.sectionSchedule')}</h2>
            <p className="text-xs text-muted-foreground">{t('vouchers.form.scheduleDescription', { zone: zoneName() })}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="starts_at"
              render={({ field }) => (
                <Field label={t('banners.form.startsAt')} hint={t('vouchers.form.startsAtHint')} error={errors.starts_at?.message}>
                  {(id) => <DateTimeField id={id} value={field.value} onChange={field.onChange} onBlur={field.onBlur} language={i18n.language} defaultTime="00:00" labels={labels} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="ends_at"
              render={({ field }) => (
                <Field label={t('banners.form.endsAt')} hint={t('vouchers.form.endsAtHint')} error={errors.ends_at?.message}>
                  {(id) => <DateTimeField id={id} value={field.value} onChange={field.onChange} onBlur={field.onBlur} language={i18n.language} defaultTime="23:59" invalid={!!errors.ends_at} labels={labels} />}
                </Field>
              )}
            />
          </div>
          <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm" aria-live="polite">{scheduleSentence(w.starts_at ?? '', w.ends_at ?? '', t, i18n.language)}</p>
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('vouchers.form.sectionScope')}</h2>
            <p className="text-xs text-muted-foreground">{t('vouchers.form.scopeDescription')}</p>
          </div>
          <div className="grid items-start gap-5 xl:grid-cols-2">
            <div className="min-w-0 space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t('vouchers.form.outletsHeading')}</h3>
              <div className="grid gap-3">
                <ChoiceCard type="radio" checked={w.outlet_scope === 'all'} onChange={() => setValue('outlet_scope', 'all', { shouldDirty: true })} icon={<Globe className="size-5" aria-hidden />} title={t('vouchers.form.outletsAll')} description={t('vouchers.form.outletsAllDescription')} />
                <ChoiceCard type="radio" checked={w.outlet_scope === 'some'} onChange={() => setValue('outlet_scope', 'some', { shouldDirty: true })} icon={<Store className="size-5" aria-hidden />} title={t('vouchers.form.outletsSome')} description={t('vouchers.form.outletsSomeDescription')} />
              </div>
              {w.outlet_scope === 'some' && (
                <Controller
                  control={control}
                  name="outlet_ids"
                  render={({ field }) => (
                    <Field label={t('vouchers.form.outletsPick')} required error={errors.outlet_ids?.message}>
                      {(id) => <MultiSelect inputId={id} ariaLabel={t('vouchers.form.outletsPick')} placeholder={t('vouchers.form.outletsPlaceholder')} noOptionsText={t('vouchers.form.outletsNone')} loading={f.pickersLoading} value={field.value} onChange={field.onChange} options={f.outlets.map((o) => ({ value: o.id, label: o.name }))} />}
                    </Field>
                  )}
                />
              )}
            </div>
            <div className="min-w-0 space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t('vouchers.form.servicesHeading')}</h3>
              <div className="grid gap-3">
                <ChoiceCard type="radio" checked={w.service_scope === 'all'} onChange={() => setValue('service_scope', 'all', { shouldDirty: true })} icon={<Tags className="size-5" aria-hidden />} title={t('vouchers.form.servicesAll')} description={t('vouchers.form.servicesAllDescription')} />
                <ChoiceCard type="radio" checked={w.service_scope === 'some'} onChange={() => setValue('service_scope', 'some', { shouldDirty: true })} icon={<Tags className="size-5" aria-hidden />} title={t('vouchers.form.servicesSome')} description={t('vouchers.form.servicesSomeDescription')} />
              </div>
              {w.service_scope === 'some' && (
                <Controller
                  control={control}
                  name="service_ids"
                  render={({ field }) => (
                    <Field label={t('vouchers.form.servicesPick')} required error={errors.service_ids?.message}>
                      {(id) => <MultiSelect inputId={id} ariaLabel={t('vouchers.form.servicesPick')} placeholder={t('vouchers.form.servicesPlaceholder')} noOptionsText={t('vouchers.form.servicesNone')} loading={f.pickersLoading} value={field.value} onChange={field.onChange} options={f.services.map((s) => ({ value: s.id, label: s.name }))} />}
                    </Field>
                  )}
                />
              )}
            </div>
          </div>
          <ErrorText error={f.pickersError} />
        </section>
      </div>

      <div className="min-w-0 space-y-5 lg:sticky lg:top-24">
        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('vouchers.form.sectionLook')}</h2>
            <p className="text-xs text-muted-foreground">{t('vouchers.form.lookDescription')}</p>
          </div>
          <VoucherStub voucher={stub} />
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <Field label={t('vouchers.form.color')} error={errors.color?.message}>
                {() => (
                  <div role="radiogroup" aria-label={t('vouchers.form.color')} className="flex flex-wrap gap-2">
                    {VOUCHER_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={field.value === c}
                        aria-label={c}
                        onClick={() => field.onChange(c)}
                        style={{ backgroundColor: c }}
                        className={`size-9 rounded-full border-2 transition-transform focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none ${field.value === c ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105'}`}
                      />
                    ))}
                  </div>
                )}
              </Field>
            )}
          />
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('vouchers.form.sectionImage')}</h2>
            <p className="text-xs text-muted-foreground">{t('vouchers.form.imageDescription')}</p>
          </div>
          <Controller
            control={control}
            name="image_url"
            render={({ field }) => <BannerImage value={field.value} onChange={(url) => field.onChange(url)} error={errors.image_url?.message} title={w.title} folder="vouchers" ratio={VOUCHER_RATIO} onUploadingChange={f.setUploading} />}
          />
        </section>

        <section className={SECTION}>
          <h2 className="text-sm font-semibold">{t('vouchers.form.sectionStatus')}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ChoiceCard type="radio" checked={status === 'active'} onChange={() => setValue('status', 'active', { shouldDirty: true })} icon={<Power className="size-5" aria-hidden />} title={t('vouchers.form.statusActive')} description={t('vouchers.form.statusActiveDescription')} />
            <ChoiceCard type="radio" checked={status === 'inactive'} onChange={() => setValue('status', 'inactive', { shouldDirty: true })} icon={<PowerOff className="size-5" aria-hidden />} title={t('vouchers.form.statusInactive')} description={t('vouchers.form.statusInactiveDescription')} />
          </div>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {t('vouchers.form.afterSaving')} <Badge tone={LIVE_TONE[preview]} size="sm">{t(`vouchers.live.${preview}`)}</Badge>
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" disabled={f.saving || f.uploading}>{voucher ? t('common.save') : t('common.create')}</Button>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
        </div>
        {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
        <ErrorText error={f.error} />
      </div>
    </form>
  );
}
