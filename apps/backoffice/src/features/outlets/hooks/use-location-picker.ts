import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useDebounced } from '@wuzz/web-ui';
import type { GeocodeLanguage, GeocodeResult } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { MIN_SEARCH_LENGTH, useGeocodeSearch, useReverseGeocode } from '@/services/hooks/apis';
import type { PickerFocus } from '../components/outlet-picker-canvas';
import type { OutletValues } from '../utils/outlet-form.schema';

/** The address search waits for typing to pause this long (Nominatim's policy asks for restraint); the pin's address waits a bit longer. */
const SEARCH_DEBOUNCE_MS = 600;
const REVERSE_DEBOUNCE_MS = 800;

const placed = (p: { latitude: number; longitude: number } | null): p is { latitude: number; longitude: number } =>
  !!p && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180 && !(p.latitude === 0 && p.longitude === 0);

type Geo = { state: 'idle' | 'locating' } | { state: 'error'; message: string };

/**
 * Everything the location picker does: the address search (a combobox: typed text, the matching places, the highlighted one),
 * moving the pin from the map, the search, the browser's own position or the keyboard, the address found near the pin, and
 * copying an address into the form. The pin itself is the form's latitude and longitude, so the fields and the map never disagree.
 */
export function useLocationPicker(form: UseFormReturn<OutletValues>, position: { latitude: number; longitude: number } | null, onPick: (latitude: number, longitude: number) => void) {
  const { t, i18n } = useTranslation();
  const language: GeocodeLanguage = i18n.language.startsWith('id') ? 'id' : 'en';

  const [text, setText] = useState('');
  // What was typed by hand: only this is searched (a place chosen from the list fills the box, but that is not a new search).
  const [typed, setTyped] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [chosen, setChosen] = useState<GeocodeResult | null>(null);
  const [focus, setFocus] = useState<PickerFocus | null>(null);
  const [geo, setGeo] = useState<Geo>({ state: 'idle' });
  const [used, setUsed] = useState(false);
  // The map's centre while it is being moved (the readout follows it before the form is told).
  const [live, setLive] = useState<{ latitude: number; longitude: number } | null>(null);

  const query = useDebounced(typed.trim(), SEARCH_DEBOUNCE_MS);
  const search = useGeocodeSearch(query, language);
  const results = search.data ?? [];
  const typing = typed.trim() !== query;
  const searching = typed.trim().length >= MIN_SEARCH_LENGTH && (typing || search.isFetching);

  // The address near the pin: asked once the pin has stood still.
  const pointKey = placed(position) ? `${position.latitude},${position.longitude}` : '';
  const settled = useDebounced(pointKey, REVERSE_DEBOUNCE_MS);
  const [lat, lng] = settled ? settled.split(',').map(Number) : [];
  // A place chosen from the search already has its address; only a pin put down by hand needs asking.
  const reverse = useReverseGeocode(!chosen && lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : null, language);

  const suggestion = chosen?.label ?? (pointKey && settled === pointKey ? reverse.data?.label : undefined);

  useEffect(() => setUsed(false), [suggestion]);

  /** The pin was moved by hand (the map, a drag, the arrow keys): whatever the search chose no longer describes it. */
  const pickByHand = (latitude: number, longitude: number) => {
    setChosen(null);
    onPick(latitude, longitude);
  };

  const choose = (r: GeocodeResult) => {
    setChosen(r);
    setText(r.label);
    setOpen(false);
    setActive(-1);
    onPick(r.latitude, r.longitude);
    setFocus({ latitude: r.latitude, longitude: r.longitude, zoom: 17, nonce: Date.now() });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (results.length === 0) return;
      e.preventDefault();
      setOpen(true);
      setActive((i) => (e.key === 'ArrowDown' ? (i + 1) % results.length : (i <= 0 ? results.length : i) - 1));
    } else if (e.key === 'Enter') {
      const r = results[active];
      e.preventDefault(); // Enter in the search box must never submit the whole form
      if (open && r) choose(r);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  };

  const locate = () => {
    if (!('geolocation' in navigator)) return setGeo({ state: 'error', message: t('outlets.picker.geoUnsupported') });
    setGeo({ state: 'locating' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGeo({ state: 'idle' });
        pickByHand(coords.latitude, coords.longitude);
        setFocus({ latitude: coords.latitude, longitude: coords.longitude, zoom: 17, nonce: Date.now() });
      },
      (err) => setGeo({ state: 'error', message: t(err.code === err.PERMISSION_DENIED ? 'outlets.picker.geoDenied' : err.code === err.TIMEOUT ? 'outlets.picker.geoTimeout' : 'outlets.picker.geoUnavailable') }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const recenter = () => placed(position) && setFocus({ ...position, zoom: 17, nonce: Date.now() });

  const useAddress = () => {
    if (!suggestion) return;
    form.setValue('address', suggestion, { shouldDirty: true, shouldValidate: true });
    setUsed(true);
  };

  return {
    text,
    onText: (v: string) => {
      setText(v);
      setTyped(v);
      setOpen(true);
      setActive(-1);
    },
    open: open && typed.trim().length >= MIN_SEARCH_LENGTH && chosen === null,
    setOpen,
    active,
    setActive,
    results,
    searching,
    searchFailed: search.isError,
    noResults: !searching && !search.isError && search.isSuccess && query === typed.trim() && results.length === 0,
    choose,
    onKeyDown,
    pickByHand,
    live,
    setLive,
    focus,
    geo,
    locate,
    recenter,
    suggestion,
    useAddress,
    addressUsed: used,
    hasPin: placed(position),
  };
}
