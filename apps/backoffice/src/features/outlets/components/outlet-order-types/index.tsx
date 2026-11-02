import { Bike, Store } from 'lucide-react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { ChoiceCard, Field } from '@wuzz/web-ui';
import { DELIVERY_TYPES } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import type { OutletValues } from '../../utils/outlet-form.schema';

/** How orders reach the customer at this outlet, as cards: pick up at the outlet, delivery, or both (at least one). */
export function OutletOrderTypes({ form }: { form: UseFormReturn<OutletValues> }) {
  const { t } = useTranslation();
  const { errors } = form.formState;
  return (
    <Controller
      control={form.control}
      name="delivery_types"
      render={({ field }) => (
        <Field className="col-span-full" required label={t('outlets.hours.delivery')} hint={t('outlets.hours.deliveryHint')} error={errors.delivery_types?.message}>
          {() => (
            <div className="grid gap-3 sm:grid-cols-2">
              {DELIVERY_TYPES.map((d) => (
                <ChoiceCard
                  key={d}
                  checked={field.value.includes(d)}
                  onChange={(on) => field.onChange(on ? [...field.value, d] : field.value.filter((x) => x !== d))}
                  icon={d === 'pickup' ? <Store className="size-5" aria-hidden /> : <Bike className="size-5" aria-hidden />}
                  title={t(`outlets.delivery.${d}`)}
                  description={t(`outlets.delivery.${d}Desc`)}
                />
              ))}
            </div>
          )}
        </Field>
      )}
    />
  );
}
