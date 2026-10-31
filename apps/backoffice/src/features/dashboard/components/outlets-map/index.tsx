import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// Vite bundles the worker (with the shared chunk it imports) and hands back its URL; left to itself, maplibre
// looks for the worker next to the page and does not find it.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useEffect, useRef, useState } from 'react';
import { distanceKm, formatDistance } from '@/core/utils/geo';
import { useTranslation } from '@/core/utils/i18n';
import type { Area, Outlet } from '@/core/api';

maplibregl.setWorkerUrl(workerUrl);

// Free vector tiles from OpenStreetMap data; no key and no billing. A light, quiet style: the pins are the content.
const STYLE = 'https://tiles.openfreemap.org/styles/positron';
const JAKARTA: [number, number] = [106.83, -6.22];
/** How long the map must stand still before the area is reported (and so fetched). */
const SETTLE_MS = 350;
const LINKS = 'links';

type Pin = { outlet: Outlet; el: HTMLElement; dot: HTMLElement; marker: maplibregl.Marker };

const placed = (o: Outlet) => Number.isFinite(o.latitude) && Number.isFinite(o.longitude) && !(o.latitude === 0 && o.longitude === 0);

/**
 * A pin: the brand colour for an active outlet, grey for one that is switched off. The map moves the outer
 * element with its own transform, so the hover scale goes on the dot inside it: scaling the outer one would
 * overwrite the map's positioning and smear the pin.
 */
function pinElement(active: boolean) {
  const el = document.createElement('div');
  el.style.cssText = 'width:22px;height:22px;display:grid;place-items:center;cursor:pointer';
  const dot = document.createElement('div');
  dot.style.cssText = `width:18px;height:18px;border-radius:9999px;border:3px solid #fff;box-sizing:border-box;
    background:${active ? '#e2483d' : '#9ca3af'};transition:transform .15s ease,box-shadow .15s ease`;
  el.addEventListener('mouseenter', () => (dot.style.transform = 'scale(1.3)'));
  el.addEventListener('mouseleave', () => (dot.style.transform = ''));
  el.append(dot);
  return { el, dot };
}

/** The card shown over a pin. Built from DOM nodes, not an HTML string, so an outlet's name can never inject markup. */
function card(o: Outlet, status: string): HTMLElement {
  const box = document.createElement('div');
  box.className = 'outlet-card';
  // The banner, when the outlet has one. Only an https address is ever put in an <img>, and a picture that will not
  // load is removed rather than shown as a broken icon.
  const bannerUrl = o.images[0] ?? '';
  if (bannerUrl.startsWith('https://')) {
    const banner = document.createElement('img');
    banner.className = 'outlet-card__banner';
    banner.alt = '';
    banner.loading = 'lazy';
    banner.onerror = () => banner.remove();
    banner.src = bannerUrl;
    box.append(banner);
  }
  const head = document.createElement('div');
  head.className = 'outlet-card__head';
  const name = document.createElement('div');
  name.className = 'outlet-card__name';
  name.textContent = o.name;
  const st = document.createElement('span');
  st.className = `outlet-card__status ${o.active ? 'is-active' : 'is-off'}`;
  st.textContent = status;
  head.append(name, st);
  box.append(head);
  for (const text of [o.address, o.phone]) {
    if (!text) continue;
    const line = document.createElement('div');
    line.className = 'outlet-card__line';
    line.textContent = text;
    box.append(line);
  }
  return box;
}

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Where the outlets are. `all` is every outlet (the first view fits them, and "nearest" is measured among them);
 * `shown` is the ones inside the map's current area. When the map stops moving for a moment, `onAreaChange` reports
 * the area so the caller can fetch just those. Hover a pin for its card, with the nearest other outlet; click a pin
 * to draw straight lines to the other outlets in view, each with its distance.
 */
export default function OutletsMap({
  all,
  shown,
  onAreaChange,
}: {
  all: Outlet[];
  shown: Outlet[];
  onAreaChange: (area: Area) => void;
}) {
  const { t, i18n } = useTranslation();
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pins = useRef<Map<number, Pin>>(new Map());
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  // The latest callback and data, read by listeners that live as long as the map.
  const latest = useRef({ onAreaChange, all });
  latest.current = { onAreaChange, all };

  // The map itself: made once.
  useEffect(() => {
    if (!box.current) return;
    setFailed(false);
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({
        container: box.current,
        style: STYLE,
        center: JAKARTA,
        zoom: 9,
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
    } catch {
      setFailed(true);
      return;
    }
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    // The style and tiles come from the internet. If the map never gets as far as drawing, say so instead of
    // showing an empty grey box; once it has drawn, a single tile that fails to load is not worth hiding the map for.
    let drawn = false;
    m.on('error', (e) => {
      console.error('outlet map:', e.error);
      if (!drawn && (e.error as { status?: number } | undefined)?.status !== 404) setFailed(true);
    });

    m.once('load', () => {
      drawn = true;
      // The attribution starts open; it has to stay (as an (i)), but it need not cover the map.
      m.getContainer().querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
      // Straight lines from the chosen outlet to the others, each labelled with its distance.
      m.addSource(LINKS, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({ id: `${LINKS}-line`, type: 'line', source: LINKS, paint: { 'line-color': '#e2483d', 'line-width': 2, 'line-dasharray': [2, 2] } });
      m.addLayer({
        id: `${LINKS}-label`,
        type: 'symbol',
        source: LINKS,
        layout: { 'text-field': ['get', 'label'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'symbol-placement': 'line-center', 'text-allow-overlap': true },
        paint: { 'text-color': '#171717', 'text-halo-color': '#ffffff', 'text-halo-width': 2 },
      });
      const fit = new maplibregl.LngLatBounds();
      for (const o of latest.current.all) if (placed(o)) fit.extend([o.longitude, o.latitude]);
      if (!fit.isEmpty()) m.fitBounds(fit, { padding: 48, maxZoom: 13, duration: 0 });
      setReady(true);
    });

    // Report the area once the map has stood still for a moment, not on every frame of a drag or a zoom.
    let timer: ReturnType<typeof setTimeout> | undefined;
    m.on('moveend', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const b = m.getBounds();
        latest.current.onAreaChange({ south: round(b.getSouth()), west: round(b.getWest()), north: round(b.getNorth()), east: round(b.getEast()) });
      }, SETTLE_MS);
    });
    // A click on the map itself (not a pin) clears the chosen outlet.
    m.on('click', () => setSelected(null));

    // Follows the box if it gets its final size after the map is made (a lazy chunk, a flex layout).
    const resize = new ResizeObserver(() => m.resize());
    resize.observe(box.current);

    const ownPins = pins.current;
    return () => {
      clearTimeout(timer);
      resize.disconnect();
      for (const p of ownPins.values()) p.marker.remove();
      ownPins.clear();
      m.remove();
      map.current = null;
      setReady(false);
    };
  }, []);

  // The pins: added and removed as the shown outlets change, so the ones that stay do not blink.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    const wanted = new Map(shown.filter(placed).map((o) => [o.id, o]));
    for (const [id, pin] of pins.current) {
      if (!wanted.has(id)) {
        pin.marker.remove();
        pins.current.delete(id);
      }
    }
    for (const o of wanted.values()) {
      const existing = pins.current.get(o.id);
      if (existing) {
        existing.outlet = o;
        continue;
      }
      const { el, dot } = pinElement(o.active);
      const marker = new maplibregl.Marker({ element: el }).setLngLat([o.longitude, o.latitude]).addTo(m);
      // Over a pin its card shows; off the pin it goes. A tap picks the outlet, which also keeps its card up.
      el.addEventListener('mouseenter', () => setHovered(o.id));
      el.addEventListener('mouseleave', () => setHovered(null));
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // not a click on the map: that one clears the choice
        setSelected((cur) => (cur === o.id ? null : o.id));
      });
      pins.current.set(o.id, { outlet: o, el, dot, marker });
    }
  }, [shown, ready]);

  // The outlet's card: one fixed panel in the corner of the map, filled with whichever outlet the pointer is on (or the
  // chosen one). A card pinned to the marker would be cut off by the map's edge wherever the pin is near it.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const id = hovered ?? selected;
    const outlet = id === null ? undefined : (pins.current.get(id)?.outlet ?? shown.find((o) => o.id === id));
    if (!outlet) {
      el.dataset.open = '0';
      return;
    }
    el.replaceChildren(card(outlet, outlet.active ? t('common.active') : t('dashboard.inactive')));
    el.dataset.open = '1';
  }, [hovered, selected, shown, t]);

  // The chosen outlet: a ring on its pin, and lines to the others in view.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    for (const [id, pin] of pins.current) pin.dot.style.boxShadow = id === selected ? '0 0 0 3px rgba(226,72,61,.35)' : '';
    const from = selected === null ? undefined : pins.current.get(selected)?.outlet;
    const features = from
      ? shown
          .filter((o) => o.id !== from.id && placed(o))
          .map((o) => ({
            type: 'Feature' as const,
            properties: { label: formatDistance(distanceKm(from, o), i18n.language) },
            geometry: { type: 'LineString' as const, coordinates: [[from.longitude, from.latitude], [o.longitude, o.latitude]] },
          }))
      : [];
    (m.getSource(LINKS) as maplibregl.GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features });
  }, [selected, shown, ready, i18n.language]);

  if (failed) {
    return <div className="absolute inset-0 grid place-items-center bg-card p-4 text-center text-xs text-muted-foreground">{t('dashboard.mapFailed')}</div>;
  }
  // maplibre's own CSS makes its container `position: relative`, which would undo an `absolute inset-0` on it: the
  // wrapper fills the card and the map fills the wrapper. Clip hard: `overflow-hidden` alone lets GPU-composited
  // children (the pins) escape a rounded parent in some browsers, so the box also isolates and contains its paint.
  return (
    <div className="absolute inset-0 isolate overflow-hidden [contain:paint]">
      <div ref={box} className="h-full w-full overflow-hidden dark:[&_canvas]:invert dark:[&_canvas]:hue-rotate-180" />
      <div ref={panel} data-open="0" className="outlet-panel" />
    </div>
  );
}
