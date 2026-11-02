import type { ReactNode } from 'react';
import { useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { Power } from 'lucide-react';
import { Button, ChoiceCard, ErrorText, Field, FormActions, FormSection, Select, TextField } from '@wuzz/web-ui';
import { OUTLET_CATEGORIES, type Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { usePublishFormActions } from '@/features/shell/components/form-header-actions';
import { useOutletForm } from '../../hooks/use-outlet-form';
import { MAX_EMAIL_LENGTH } from '../../utils/outlet-form.schema';
import { OutletOrderTypes } from '../outlet-order-types';
import { OutletScheduleFields } from '../outlet-schedule-fields';
import { OutletImages } from '../outlet-images';
import { OutletLocationPicker } from '../outlet-location-picker';
import { OutletBanner } from '../outlet-map';

/** The form of the create / edit page that makes or edits an outlet: name, phone, address, where it is on the map, and its picture. */
export function OutletForm({ outlet, header, onSaved, onCancel }: { outlet?: Outlet; header?: ReactNode; onSaved: (saved: Outlet) => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const f = useOutletForm(outlet, onSaved);
  const { register, formState } = f.form;
  const { errors } = formState;
  const [uploading, setUploading] = useState(false);
  usePublishFormActions({ formId: 'outlet-form', saving: f.saving || uploading, editing: !!outlet, onCancel });
  // The map over the form only shows where the picker below it points (the same yellow pin); the picker is what moves it.
  const [name, images, active] = useWatch({ control: f.form.control, name: ['name', 'images', 'active'] });
  const marker = f.position ? [{ id: outlet?.id ?? 0, name: name || outlet?.name || '', address: '', phone: '', image: images?.[0] ?? '', latitude: f.position.latitude, longitude: f.position.longitude, active: active ?? true }] : [];

  return (
    <OutletBanner markers={marker} pin header={header}>
      <form id="outlet-form" noValidate className="space-y-4" onSubmit={f.submit}>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <FormSection title={t('outlets.form.sectionGeneral')} columns={1}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-4">
            <TextField label={t('common.name')} required placeholder={t('outlets.form.namePlaceholder')} error={errors.name?.message} {...register('name')} />
            <TextField label={t('common.phone')} required placeholder={t('outlets.form.phonePlaceholder')} inputMode="tel" error={errors.phone?.message} {...register('phone')} />
            <TextField
              label={t('common.email')}
              required
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder={t('outlets.form.emailPlaceholder')}
              maxLength={MAX_EMAIL_LENGTH}
              error={errors.email?.message}
              {...register('email')}
            />
            <Controller
              control={f.form.control}
              name="category"
              render={({ field }) => (
                <Field label={t('outlets.hours.category')} required error={errors.category?.message}>
                  {() => <Select ariaLabel={t('outlets.hours.category')} placeholder={t('outlets.form.categoryPlaceholder')} className="w-full" value={field.value} onChange={field.onChange} options={OUTLET_CATEGORIES.map((c) => ({ value: c, label: t(`outlets.category.${c}`) }))} />}
                </Field>
              )}
            />
            </div>
            <OutletOrderTypes form={f.form} />
            {outlet && (
              <Controller
                control={f.form.control}
                name="active"
                render={({ field }) => (
                  <ChoiceCard
                    checked={field.value}
                    onChange={field.onChange}
                    icon={<Power className="size-5" aria-hidden />}
                    title={t('outlets.form.activeTitle')}
                    description={t('outlets.form.activeDescription')}
                  />
                )}
              />
            )}
          </FormSection>

          <OutletScheduleFields form={f.form} timezone={f.timezone} />
        </div>

        <OutletLocationPicker form={f.form} position={f.position} onPick={f.pick} />

        <FormSection title={t('outlets.form.sectionBanner')} description={t('outlets.form.bannerDescription')} columns={1}>
          <Controller control={f.form.control} name="images" render={({ field }) => <OutletImages onUploadingChange={setUploading} name={outlet?.name} value={field.value} onChange={field.onChange} error={errors.images?.message ?? errors.images?.find?.((x) => x)?.message} />} />
        </FormSection>

        <ErrorText error={f.error} />
        <FormActions>
          <Button type="submit" variant="primary" disabled={f.saving || uploading}>{outlet ? t('common.save') : t('common.create')}</Button>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
        </FormActions>
      </form>
    </OutletBanner>
  );
}
