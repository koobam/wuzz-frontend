import { Crosshair, LocateFixed, Loader2, MapPin, Search } from 'lucide-react';
import { lazy, Suspense } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Badge, Button, Input, TextField } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { useLocationPicker } from '../../hooks/use-location-picker';
import type { OutletValues } from '../../utils/outlet-form.schema';

// The map library is heavy; it loads with the form, not with the app.
const Canvas = lazy(() => import('../outlet-picker-canvas'));

/**
 * The "Location" card of the outlet form. The map fills the card edge to edge and carries the controls laid over it: the address
 * search and the two buttons (your position, centre on the pin) at the top, and at the bottom the address near the pin (with a
 * button to copy it into the Address field) and the coordinates. The Address, Latitude and Longitude fields sit below the map,
 * editable, and the pin and the fields always follow each other.
 */
export function OutletLocationPicker({
  form,
  position,
  onPick,
}: {
  form: UseFormReturn<OutletValues>;
  position: { latitude: number; longitude: number } | null;
  onPick: (latitude: number, longitude: number) => void;
}) {
  const { t } = useTranslation();
  const p = useLocationPicker(form, position, onPick);
  const { register, formState } = form;
  const { errors } = formState;
  const listId = 'outlet-place-results';

  const here = p.live ?? (p.hasPin ? position : null);
  const chip = 'pointer-events-auto rounded-xl border border-border bg-card px-3 py-2 text-sm';

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="space-y-0.5 p-5 pb-4">
        <h2 className="text-sm font-semibold">{t('outlets.form.sectionLocation')}</h2>
        <p className="text-xs text-muted-foreground">{t('outlets.form.locationDescription')}</p>
      </div>

      {/* The map runs edge to edge inside the card; the search, the two buttons and the readouts are laid over it. Only the
          controls take the pointer, so the rest of the overlay never blocks panning the map. */}
      <div role="group" aria-label={t('outlets.picker.mapLabel')} className="relative h-[22rem] bg-muted sm:h-[28rem]">
        <Suspense fallback={<div className="h-full animate-pulse bg-muted" />}>
          <Canvas
            position={position}
            onPick={p.pickByHand}
            onLive={p.setLive}
            focus={p.focus}
            labels={{
              pin: t('outlets.picker.pinLabel'),
              hint: t('outlets.picker.dragHint'),
              failed: t('dashboard.mapFailed'),
              gestures: { windows: t('outlets.picker.gesturesWindows'), mac: t('outlets.picker.gesturesMac'), mobile: t('outlets.picker.gesturesMobile') },
            }}
          />
        </Suspense>

        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start gap-2">
          <div className="pointer-events-auto relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              role="combobox"
              aria-label={t('outlets.picker.searchLabel')}
              aria-expanded={p.open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={p.active >= 0 ? `${listId}-${p.active}` : undefined}
              autoComplete="off"
              maxLength={120}
              className="border-border py-2.5 pl-11"
              placeholder={t('outlets.picker.searchPlaceholder')}
              value={p.text}
              onChange={(e) => p.onText(e.target.value)}
              onKeyDown={p.onKeyDown}
              onFocus={() => p.setOpen(true)}
              onBlur={() => setTimeout(() => p.setOpen(false), 120)}
            />
            {p.open && (
              <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-2xl border border-border bg-card text-sm">
                {p.searching && (
                  <p className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden /> {t('outlets.picker.searching')}
                  </p>
                )}
                {!p.searching && p.searchFailed && <p className="px-4 py-3 text-destructive">{t('outlets.picker.searchFailed')}</p>}
                {p.noResults && <p className="px-4 py-3 text-muted-foreground">{t('outlets.picker.noResults')}</p>}
                {!p.searching && p.results.length > 0 && (
                  <ul id={listId} role="listbox" aria-label={t('outlets.picker.resultsLabel')} className="max-h-64 divide-y divide-border overflow-y-auto">
                    {p.results.map((r, i) => (
                      <li
                        key={r.id}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === p.active}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => p.choose(r)}
                        onMouseEnter={() => p.setActive(i)}
                        className={`flex cursor-pointer items-start gap-2 px-4 py-2.5 ${i === p.active ? 'bg-accent' : 'hover:bg-accent/60'}`}
                      >
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="border-t border-border px-4 py-1.5 text-[11px] text-muted-foreground">{t('outlets.picker.credit')}</p>
              </div>
            )}
          </div>
          <Button
            size="lg"
            onClick={p.locate}
            disabled={p.geo.state === 'locating'}
            title={t('outlets.picker.useMyLocation')}
            aria-label={t('outlets.picker.useMyLocation')}
            className="pointer-events-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 sm:px-4"
          >
            {p.geo.state === 'locating' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LocateFixed className="size-4" aria-hidden />}
            <span className="hidden sm:inline">{p.geo.state === 'locating' ? t('outlets.picker.locating') : t('outlets.picker.useMyLocation')}</span>
          </Button>
          <Button
            size="lg"
            onClick={p.recenter}
            disabled={!p.hasPin}
            title={t('outlets.picker.recenter')}
            aria-label={t('outlets.picker.recenter')}
            className="pointer-events-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 sm:px-4"
          >
            <Crosshair className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t('outlets.picker.recenter')}</span>
          </Button>
        </div>
        {p.geo.state === 'error' && (
          <p role="alert" className={`${chip} absolute top-[4.25rem] left-3 z-20 text-xs text-destructive`}>{p.geo.message}</p>
        )}

        {/* One flat bar over the bottom of the map: the address near the pin (cut with an ellipsis, the whole text on hover), the
            button that uses it, and the pin's exact coordinates with a copy button. On a narrow screen it wraps to two rows. */}
        <div className={`${chip} absolute right-14 bottom-3 left-3 z-20 sm:right-[4.75rem] flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap`}>
          {p.suggestion && (
            <>
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={t('outlets.picker.near', { place: p.suggestion })}>
                {t('outlets.picker.near', { place: p.suggestion })}
              </span>
              <Button size="sm" onClick={p.useAddress} disabled={p.addressUsed} className="shrink-0">
                {p.addressUsed ? t('outlets.picker.addressUsed') : t('outlets.picker.useAddress')}
              </Button>
            </>
          )}
          {here ? (
            <span className={`flex shrink-0 basis-full items-center gap-2 sm:basis-auto [&>button]:px-2 [&>button]:text-[11px] sm:[&>button]:px-2.5 sm:[&>button]:text-xs ${p.suggestion ? '' : 'flex-1'}`}>
              <span className="sr-only text-xs whitespace-nowrap text-muted-foreground sm:not-sr-only">{t('outlets.picker.coordinates')}</span>
              <Badge copy={`${here.latitude}, ${here.longitude}`} tone="muted" size="sm">{`${here.latitude}, ${here.longitude}`}</Badge>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{t('outlets.picker.noPin')}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <TextField fieldClassName="sm:col-span-2" label={t('outlets.address')} placeholder={t('outlets.form.addressPlaceholder')} error={errors.address?.message} {...register('address')} />
        <TextField label={t('outlets.latitude')} required placeholder={t('outlets.form.latPlaceholder')} type="number" step="any" min={-90} max={90} error={errors.latitude?.message} {...register('latitude', { valueAsNumber: true })} />
        <TextField label={t('outlets.longitude')} required placeholder={t('outlets.form.lngPlaceholder')} type="number" step="any" min={-180} max={180} error={errors.longitude?.message} {...register('longitude', { valueAsNumber: true })} />
      </div>
    </section>
  );
}
