import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// Vite bundles the worker and hands back its URL; left to itself, maplibre looks for the worker next to the page.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useEffect, useRef, useState } from 'react';
import { createHoverCard, type HoverCard } from '../../utils/hover-card';
import { createOutletMarker, MARKER_HEIGHT } from '../../utils/outlet-marker';
import { isShownImage } from '../../utils/outlet-form.schema';
import { createPin, PIN_PICKER } from '../../utils/pin';

maplibregl.setWorkerUrl(workerUrl);

// The same free OpenStreetMap vector tiles as the dashboard's map: no key, no billing.
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
export const MAP_DEFAULT_CENTER: [number, number] = [106.83, -6.22];

/** An outlet on the map. */
export type MapMarker = { id: number; name: string; address: string; phone: string; image: string; latitude: number; longitude: number; active: boolean };
export type MapPoint = { latitude: number; longitude: number };

const placed = (p: MapPoint) => Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180 && !(p.latitude === 0 && p.longitude === 0);

/** The outlet's card: its banner, name, status, address, phone and a hint that it opens the outlet. Built from nodes, so a name can never inject markup. */
function cardContent(o: MapMarker, labels: { active: string; inactive: string; hint: string }) {
  const box = document.createElement('div');
  if (isShownImage(o.image)) {
    const banner = document.createElement('img');
    banner.className = 'outlet-card__banner';
    banner.alt = '';
    banner.loading = 'lazy';
    banner.onerror = () => banner.remove();
    banner.src = o.image;
    box.append(banner);
  }
  const head = document.createElement('div');
  head.className = 'outlet-card__head';
  const name = document.createElement('div');
  name.className = 'outlet-card__name';
  name.textContent = o.name;
  const status = document.createElement('span');
  status.className = `outlet-card__status ${o.active ? 'is-active' : 'is-off'}`;
  status.textContent = o.active ? labels.active : labels.inactive;
  head.append(name, status);
  box.append(head);
  for (const text of [o.address, o.phone]) {
    if (!text) continue;
    const line = document.createElement('div');
    line.className = 'outlet-card__line';
    line.textContent = text;
    box.append(line);
  }
  const hint = document.createElement('div');
  hint.className = 'outlet-card__hint';
  hint.textContent = `${labels.hint} →`;
  box.append(hint);
  return box;
}

/**
 * The outlets on a map banner. With several markers it fits them all; with one it centres on it. A pin opens a small card
 * with the outlet's name and a way to its page. `editable` turns it into a picker: a click on the map or a drag of the pin
 * reports the point through `onPick`, and `position` moves the pin when the fields behind it change.
 */
export default function OutletMapCanvas({
  markers,
  selectedId,
  editable = false,
  position,
  onPick,
  onOpen,
  labels,
  failedLabel,
  pin = false,
}: {
  markers: MapMarker[];
  selectedId?: number;
  editable?: boolean;
  position?: MapPoint | null;
  onPick?: (latitude: number, longitude: number) => void;
  onOpen?: (id: number) => void;
  /** The words on an outlet's card. */
  labels: { active: string; inactive: string; hint: string };
  failedLabel: string;
  /** Draw each point as the yellow location pin of the picker (the outlet form's map) instead of the outlet's photo marker: no card, nothing to open. */
  pin?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pins = useRef<maplibregl.Marker[]>([]);
  const cards = useRef<HoverCard[]>([]);
  const unfollow = useRef<() => void>(() => {});
  const picker = useRef<maplibregl.Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // The latest callbacks, read by listeners that live as long as the map.
  const latest = useRef({ onPick, onOpen, editable, labels });
  latest.current = { onPick, onOpen, editable, labels };

  useEffect(() => {
    if (!box.current) return;
    setFailed(false);
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({ container: box.current, style: MAP_STYLE, center: MAP_DEFAULT_CENTER, zoom: 10, attributionControl: false, cooperativeGestures: true });
    } catch {
      setFailed(true);
      return;
    }
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-left');

    // If the style and tiles never arrive, say so instead of showing an empty grey box; once it has drawn, a single failed tile is not worth hiding the map for.
    let drawn = false;
    m.on('error', (e) => {
      console.error('outlet map:', e.error);
      if (!drawn && (e.error as { status?: number } | undefined)?.status !== 404) setFailed(true);
    });
    m.once('load', () => {
      drawn = true;
      m.getContainer().querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
      setReady(true);
    });
    m.on('click', (e) => {
      if (latest.current.editable) latest.current.onPick?.(e.lngLat.lat, e.lngLat.lng);
    });
    const resize = new ResizeObserver(() => m.resize());
    resize.observe(box.current);

    return () => {
      resize.disconnect();
      for (const p of pins.current) p.remove();
      pins.current = [];
      unfollow.current();
      for (const c of cards.current) c.hide();
      cards.current = [];
      picker.current?.remove();
      picker.current = null;
      m.remove();
      map.current = null;
      setReady(false);
    };
  }, []);

  // The pins, and where the view starts: redone only when the outlets themselves change.
  const signature = markers.map((o) => `${o.id}:${o.latitude}:${o.longitude}:${o.active}:${o.name}`).join('|') + `#${selectedId ?? ''}`;
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    for (const p of pins.current) p.remove();
    pins.current = [];
    unfollow.current();
    for (const c of cards.current) c.hide();
    cards.current = [];
    const shown = markers.filter(placed);
    for (const o of shown) {
      if (pin) {
        // The form's map: the picker's pin (its ground dot on the point), following the form's latitude and longitude; not a control.
        const made = createPin({ label: o.name, color: PIN_PICKER, decorative: true });
        pins.current.push(new maplibregl.Marker({ element: made.element, anchor: 'bottom', offset: [0, made.groundOffset] }).setLngLat([o.longitude, o.latitude]).addTo(m));
        continue;
      }
      const el = createOutletMarker({ name: o.name, image: o.image, selected: o.id === selectedId, active: o.active });
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([o.longitude, o.latitude]).addTo(m);
      // The chosen outlet, and the one whose card is open, are drawn over the others.
      el.style.zIndex = o.id === selectedId ? '2' : '1';
      const card = createHoverCard(cardContent(o, latest.current.labels), {
        onOpen: () => (el.style.zIndex = '3'),
        onClose: () => (el.style.zIndex = o.id === selectedId ? '2' : '1'),
      });
      cards.current.push(card);
      pins.current.push(marker);

      // The card shows while the pointer is on the pin or on the card, and goes a moment after it leaves both (so moving from the
      // one to the other keeps it open); focus shows it too, Escape closes it. A tap on a touch screen shows it first, and a tap on the
      // card then opens the outlet; with a mouse, a click on the pin opens the outlet at once.
      let timer: ReturnType<typeof setTimeout> | undefined;
      const open = () => {
        clearTimeout(timer);
        card.show(el, m.getContainer());
      };
      const closeSoon = () => {
        clearTimeout(timer);
        timer = setTimeout(() => card.hide(), 180);
      };
      const go = () => latest.current.onOpen?.(o.id);
      let touch = false;
      el.addEventListener('pointerdown', (e) => (touch = e.pointerType === 'touch'));
      el.addEventListener('mouseenter', open);
      el.addEventListener('mouseleave', closeSoon);
      el.addEventListener('focus', open);
      el.addEventListener('blur', closeSoon);
      el.addEventListener('keydown', (e) => e.key === 'Escape' && card.hide());
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (touch && !card.isOpen()) open();
        else go();
      });
      card.root.addEventListener('mouseenter', open);
      card.root.addEventListener('mouseleave', closeSoon);
      card.root.addEventListener('click', go);
      card.root.addEventListener('keydown', (e) => e.key === 'Escape' && card.hide());
    }
    // An open card follows its marker while the map moves, the page scrolls or the window changes (one update per frame).
    let frame = 0;
    const follow = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        for (const c of cards.current) c.place();
      });
    };
    m.on('move', follow);
    m.on('resize', follow);
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    unfollow.current = () => {
      cancelAnimationFrame(frame);
      m.off('move', follow);
      m.off('resize', follow);
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
    // The part of the banner the markers may use: below the floating top bar (and a marker's own height above its tip) and above the title block over the banner's bottom.
    const box = m.getContainer();
    const h = box.clientHeight;
    const barBottom = (window.innerWidth < 768 ? 200 : 96) - box.getBoundingClientRect().top;
    const padding = { top: Math.min(Math.max(barBottom, 0) + MARKER_HEIGHT + 8, h * 0.55), bottom: Math.min(150, h * 0.3), left: 64, right: 64 };
    if (shown.length === 1) {
      const only = shown[0]!;
      m.jumpTo({ center: [only.longitude, only.latitude], zoom: 15, padding });
    } else if (shown.length > 1) {
      const fit = new maplibregl.LngLatBounds();
      for (const o of shown) fit.extend([o.longitude, o.latitude]);
      m.fitBounds(fit, { padding, maxZoom: 13, duration: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, ready, pin]);

  // The picker: one draggable pin that follows the fields; the first time it appears the view goes to it.
  const lat = position?.latitude;
  const lng = position?.longitude;
  useEffect(() => {
    const m = map.current;
    if (!m || !ready || !editable) return;
    const point = lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : null;
    if (!point || !placed(point)) {
      picker.current?.remove();
      picker.current = null;
      return;
    }
    if (!picker.current) {
      // The form's picker pin is Reddog's (head, stem, ground dot), the same one the Location card's map shows.
      const made = createPin({ label: 'Pin', color: PIN_PICKER, cursor: 'grab' });
      const marker = new maplibregl.Marker({ element: made.element, draggable: true, anchor: 'bottom', offset: [0, made.groundOffset] }).setLngLat([point.longitude, point.latitude]).addTo(m);
      marker.on('dragstart', () => made.lift(true));
      marker.on('dragend', () => {
        made.lift(false);
        const at = marker.getLngLat();
        latest.current.onPick?.(at.lat, at.lng);
      });
      picker.current = marker;
      m.jumpTo({ center: [point.longitude, point.latitude], zoom: 15 });
      return;
    }
    picker.current.setLngLat([point.longitude, point.latitude]);
    if (!m.getBounds().contains([point.longitude, point.latitude])) m.easeTo({ center: [point.longitude, point.latitude], duration: 300 });
  }, [lat, lng, ready, editable]);

  if (failed) {
    return <div className="absolute inset-0 grid place-items-center bg-card p-4 text-center text-xs text-muted-foreground">{failedLabel}</div>;
  }
  // maplibre's own CSS makes its container `position: relative`, which would undo an `absolute inset-0` on it: the wrapper
  // fills the banner and the map fills the wrapper. The controls are moved down (and the attribution up) because the floating
  // top bar covers the top of the banner and the content card covers its bottom edge.
  return (
    <div className="absolute inset-0 overflow-hidden [&_.maplibregl-ctrl-top-left]:mt-[13rem] [&_.maplibregl-ctrl-top-left]:lg:ml-[5.5rem] [&_.maplibregl-ctrl-top-right]:mt-[13rem] md:[&_.maplibregl-ctrl-top-left]:mt-[5.75rem] md:[&_.maplibregl-ctrl-top-right]:mt-[5.75rem]">
      <div ref={box} data-map-ready={ready ? '1' : '0'} className="h-full w-full overflow-hidden dark:[&_canvas]:invert dark:[&_canvas]:hue-rotate-180" />
    </div>
  );
}
