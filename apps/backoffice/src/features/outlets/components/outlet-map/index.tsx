import { lazy, type ReactNode, Suspense } from 'react';
import { useTranslation } from '@/core/utils/i18n';
import type { MapMarker, MapPoint } from '../outlet-map-canvas';

// The map library is heavy; it loads with the outlet pages, not with every page.
const Canvas = lazy(() => import('../outlet-map-canvas'));

/**
 * A big map across the top of an outlet page, and the page's content below it. The map fills the whole panel: it bleeds out
 * of the page's padding on the sides (`px-3 sm:px-5`, and from `lg` a 5.25rem gutter for the rail) and at the top (the room
 * the floating top bar needs), behind the floating bars, and is about half as tall as the window; the content sits over its bottom edge (it is pulled up a little), like a card resting on a
 * banner. Flat, no shadows.
 */
export function OutletBanner({
  markers,
  selectedId,
  editable = false,
  position,
  onPick,
  onOpen,
  pin = false,
  header,
  children,
}: {
  markers: MapMarker[];
  selectedId?: number;
  editable?: boolean;
  position?: MapPoint | null;
  onPick?: (latitude: number, longitude: number) => void;
  onOpen?: (id: number) => void;
  /** The outlet form's map: the points are drawn as the yellow location pin (the picker's), not as photo markers. */
  pin?: boolean;
  /** Drawn over the bottom of the map, above the overlapping content: the page's title, description and actions (and its way back). */
  header?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div role="region" aria-label={t('outlets.map.label')} className="relative isolate -mx-3 -mt-[9.5rem] h-[clamp(26rem,55dvh,48rem)] overflow-hidden border-b border-border bg-muted sm:-mx-5 md:-mt-[5.25rem] md:h-[clamp(22rem,50dvh,48rem)] lg:-ml-[5.25rem]">
        <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-muted" />}>
          <Canvas
            markers={markers}
            selectedId={selectedId}
            editable={editable}
            position={position}
            onPick={onPick}
            onOpen={onOpen}
            pin={pin}
            labels={{ active: t('common.active'), inactive: t('dashboard.inactive'), hint: t('outlets.map.open') }}
            failedLabel={t('dashboard.mapFailed')}
          />
        </Suspense>
        {header && (
          <>
            {/* A soft scrim of the page colour under the title block, so bare text reads on any part of the map. */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-3/5 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-14 z-10 px-3 sm:bottom-[4.5rem] sm:px-5 lg:pl-[6.5rem] [&_a]:pointer-events-auto [&_button]:pointer-events-auto">{header}</div>
          </>
        )}
        {editable && (
          <div className="pointer-events-none absolute top-3 left-3 lg:left-[6.5rem] max-w-[calc(100%-5rem)] rounded-full border border-border bg-card px-3 py-1.5 text-xs">{t('outlets.map.pickHint')}</div>
        )}
      </div>
      <div className="relative z-10 -mt-8 space-y-5 sm:-mt-12">{children}</div>
    </div>
  );
}
