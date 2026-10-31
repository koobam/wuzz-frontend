import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDebounced } from '@wuzz/web-ui';
import type { GeocodeLanguage, Outlet, OutletTimezone } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useReverseGeocode, useSaveOutlet } from '@/services/hooks/apis';
import { blankOutlet, outletBody, outletSchema, type OutletValues, outletValues } from '../utils/outlet-form.schema';
import { timezoneForPoint, type TimezoneGuess, zoneOfProvince } from '../utils/timezone';

/** The pin has to stand still this long before its province is asked for (the same pause the picker uses for its address). */
const REVERSE_DEBOUNCE_MS = 800;

const placed = (p: { latitude: number; longitude: number } | null): p is { latitude: number; longitude: number } =>
  !!p && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180 && !(p.latitude === 0 && p.longitude === 0);

/**
 * The outlet's time zone follows its place. While nobody has chosen a zone by hand, the zone is read from where the pin is:
 * from the coordinate at once (an estimate), then from the province once the geocoder has named it (exact). A saved outlet keeps
 * its zone until the pin is actually moved. Choosing a zone by hand wins until "automatic" is asked for again.
 */
function useAutoTimezone(form: ReturnType<typeof useForm<OutletValues>>, position: { latitude: number; longitude: number } | null, isNew: boolean) {
  const { i18n } = useTranslation();
  const language: GeocodeLanguage = i18n.language.startsWith('id') ? 'id' : 'en';
  const [byHand, setByHand] = useState(false);
  // A saved outlet is left alone until the pin moves (or "automatic" is asked for).
  const [moved, setMoved] = useState(false);
  const first = useRef(position);
  useEffect(() => {
    const a = first.current;
    if (a && position && (a.latitude !== position.latitude || a.longitude !== position.longitude)) setMoved(true);
    if (!a && position) setMoved(true);
  }, [position]);

  const pointKey = placed(position) ? `${position.latitude},${position.longitude}` : '';
  const settled = useDebounced(pointKey, REVERSE_DEBOUNCE_MS);
  const [lat, lng] = settled ? settled.split(',').map(Number) : [];
  const reverse = useReverseGeocode(lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : null, language);
  // The province belongs to the place it was asked about: not to a pin that has moved on since.
  const place = settled === pointKey ? reverse.data : undefined;
  const province = zoneOfProvince(place?.state) ? place?.state : zoneOfProvince(place?.isoCode) ? place?.isoCode : undefined;

  const active = !byHand && (isNew || moved);
  const guess: TimezoneGuess | null = useMemo(() => (active && placed(position) ? timezoneForPoint(position, province) : null), [active, position, province]);

  const apply = guess?.timezone;
  useEffect(() => {
    if (apply && form.getValues('timezone') !== apply) form.setValue('timezone', apply, { shouldDirty: true, shouldValidate: true });
  }, [apply, form]);

  return {
    /** What the zone was read from, to tell the person (null while the zone is the saved one or was chosen by hand). */
    detected: guess,
    /** The province as the geocoder names it (for the person), when the zone came from it. */
    provinceName: guess?.source === 'province' ? (place?.state ?? guess.province) : undefined,
    byHand,
    /** The zone was picked in the select: it stays as picked. */
    setByHand: (timezone: OutletTimezone) => {
      setByHand(true);
      form.setValue('timezone', timezone, { shouldDirty: true, shouldValidate: true });
    },
    /** Back to reading the zone from the place (also for a saved outlet whose pin has not moved). */
    useAuto: () => {
      setByHand(false);
      setMoved(true);
    },
    canDetect: placed(position),
  };
}

/** The outlet form: its values and rules, where the pin is, and the save. */
export function useOutletForm(outlet: Outlet | undefined, onSaved: (saved: Outlet) => void) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const form = useForm<OutletValues>({
    resolver: zodResolver(outletSchema(t)),
    defaultValues: outlet ? outletValues(outlet) : blankOutlet(),
  });
  const latitude = useWatch({ control: form.control, name: 'latitude' });
  const longitude = useWatch({ control: form.control, name: 'longitude' });
  const save = useSaveOutlet();
  // Where the pin is: what the two fields say (nothing while they are empty or not numbers).
  const position = useMemo(() => (Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null), [latitude, longitude]);
  const timezone = useAutoTimezone(form, position, !outlet);

  return {
    form,
    position,
    timezone,
    pick: (lat: number, lng: number) => {
      form.setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
      form.setValue('longitude', lng, { shouldValidate: true, shouldDirty: true });
    },
    submit: form.handleSubmit(async (values) => {
      if (!(await ask.submit('outlet', values.name, !!outlet))) return;
      save.mutate(outletBody(values, outlet), { onSuccess: (saved) => onSaved(saved) });
    }),
    saving: save.isPending,
    error: save.error,
  };
}
