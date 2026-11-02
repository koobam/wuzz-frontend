import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
// Importing the outlet map's module also points maplibre at its bundled worker; the picker shares its tiles and centre.
import { MAP_DEFAULT_CENTER, MAP_STYLE } from '../outlet-map-canvas';
import { createPin } from '../../utils/pin';

export type PickerPoint = { latitude: number; longitude: number };
/** Asks the map to fly to a point; a new `nonce` is a new request, even to the same point. */
export type PickerFocus = PickerPoint & { zoom: number; nonce: number };

/** A point maplibre can draw: inside the world (it throws on a latitude of 95), and not the (0, 0) of an empty form. */
const placed = (p: PickerPoint | null | undefined): p is PickerPoint =>
  !!p && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180 && !(p.latitude === 0 && p.longitude === 0);

/** About 10 m of latitude in degrees; a metre of longitude is longer or shorter with the latitude, so it is scaled. */
const TEN_METRES = 0.00009;
/** Centres this close (about 0.2 m) are the same place: it keeps the form and the map from chasing each other. */
const EPSILON = 2e-6;
const INITIAL_ZOOM = 16;

/**
 * The map of the location picker, like Reddog's: the pin is FIXED at the centre of the map (a plain element laid over it, its
 * ground dot on the centre pixel), and the person moves the map underneath. While the map moves `onLive` reports the centre
 * for the readout (once a frame at most) and the pin lifts; when it stops, `onPick` commits the centre to the form. The form
 * moves the map the other way — typing in the fields, a search result, the browser's position (`focus`) — and those moves are
 * not reported back. A click on the map recentres on that point, and the arrow keys nudge the centre by about 10 m (Shift 100 m).
 */
export default function OutletPickerCanvas({
  position,
  onPick,
  onLive,
  focus,
  labels,
}: {
  position: PickerPoint | null;
  onPick: (latitude: number, longitude: number) => void;
  onLive: (point: PickerPoint | null) => void;
  focus: PickerFocus | null;
  labels: { pin: string; hint: string; failed: string; gestures: { windows: string; mac: string; mobile: string } };
}) {
  const box = useRef<HTMLDivElement>(null);
  const pinHost = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const latest = useRef({ onPick, onLive, labels, position });
  latest.current = { onPick, onLive, labels, position };
  // The map is being moved by the code (typing, a search result), not by a person: its moveend is not a choice.
  const programmatic = useRef(false);
  const pin = useRef<ReturnType<typeof createPin> | null>(null);
  const [groundOffset, setGroundOffset] = useState(6);

  useEffect(() => {
    if (!box.current) return;
    const start = latest.current.position;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({
        container: box.current,
        style: MAP_STYLE,
        center: placed(start) ? [start.longitude, start.latitude] : MAP_DEFAULT_CENTER,
        zoom: placed(start) ? INITIAL_ZOOM : 10,
        attributionControl: false,
        cooperativeGestures: true,
        locale: {
          'CooperativeGesturesHandler.WindowsHelpText': latest.current.labels.gestures.windows,
          'CooperativeGesturesHandler.MacHelpText': latest.current.labels.gestures.mac,
          'CooperativeGesturesHandler.MobileHelpText': latest.current.labels.gestures.mobile,
        },
      });
    } catch {
      setFailed(true);
      return;
    }
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // The pin: one element over the map whose ground dot sits on the centre pixel.
    const made = createPin({ label: latest.current.labels.pin, hint: latest.current.labels.hint, decorative: true });
    pin.current = made;
    setGroundOffset(made.groundOffset);
    pinHost.current?.append(made.element);

    // If the style and tiles never arrive, say so instead of showing an empty grey box; one failed tile after it has drawn is not worth hiding the map for.
    let drawn = false;
    m.on('error', (e) => {
      console.error('outlet picker map:', e.error);
      if (!drawn && (e.error as { status?: number } | undefined)?.status !== 404) setFailed(true);
    });
    m.once('load', () => {
      drawn = true;
      setReady(true);
    });

    // The readout follows the centre while the map moves, once a frame at most; `data-center` is the same figure for tests and tools.
    let frame = 0;
    const report = () => {
      frame = 0;
      const c = m.getCenter();
      box.current?.setAttribute('data-center', `${c.lat},${c.lng}`);
      box.current?.setAttribute('data-zoom', String(m.getZoom()));
      if (!programmatic.current) latest.current.onLive({ latitude: c.lat, longitude: c.lng });
    };
    // A move made by a person has the browser event behind it (a drag, the wheel, a zoom button) or our own flag (a click, the arrow
    // keys); `resize()` and the code's own moves have neither, and they are not a choice.
    const byPerson = (e: { originalEvent?: unknown; userMove?: boolean }) => !!(e.originalEvent || e.userMove);
    m.on('movestart', (e) => {
      if (programmatic.current || !byPerson(e)) return;
      made.lift(true);
      made.dismissHint();
    });
    m.on('move', () => {
      if (!frame) frame = requestAnimationFrame(report);
    });
    m.on('moveend', (e) => {
      made.lift(false);
      cancelAnimationFrame(frame);
      report();
      const wasProgrammatic = programmatic.current;
      programmatic.current = false;
      if (wasProgrammatic || !byPerson(e)) return latest.current.onLive(null);
      const c = m.getCenter();
      latest.current.onPick(c.lat, c.lng);
      latest.current.onLive(null);
    });

    // A click recentres on the point (the person can also drag); the arrow keys nudge the centre.
    m.on('click', (e) => m.easeTo({ center: e.lngLat, duration: 250 }, { userMove: true }));
    const onKey = (e: KeyboardEvent) => {
      const step = (e.shiftKey ? 10 : 1) * TEN_METRES;
      const c = m.getCenter();
      const lngStep = step / Math.max(Math.cos((c.lat * Math.PI) / 180), 0.01);
      const move: Record<string, [number, number]> = { ArrowUp: [step, 0], ArrowDown: [-step, 0], ArrowLeft: [0, -lngStep], ArrowRight: [0, lngStep] };
      const by = move[e.key];
      if (!by) return;
      e.preventDefault();
      e.stopPropagation(); // maplibre's own arrow keys pan by 100 pixels; the picker moves by metres instead
      made.dismissHint();
      m.jumpTo({ center: [c.lng + by[1], Math.max(-90, Math.min(90, c.lat + by[0]))] }, { userMove: true });
    };
    const el = box.current;
    el.addEventListener('keydown', onKey, true);
    const resize = new ResizeObserver(() => m.resize());
    resize.observe(el);

    return () => {
      el.removeEventListener('keydown', onKey, true);
      resize.disconnect();
      cancelAnimationFrame(frame);
      made.element.remove();
      pin.current = null;
      m.remove();
      map.current = null;
      setReady(false);
    };
  }, []);

  // The form moves the map: a search result or the browser's position (flown there), declared before the field-following effect below.
  const nonce = focus?.nonce;
  useEffect(() => {
    const m = map.current;
    if (!m || !ready || !focus) return;
    programmatic.current = true;
    pin.current?.dismissHint();
    m.flyTo({ center: [focus.longitude, focus.latitude], zoom: focus.zoom, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ready]);

  // The fields move the map: a point typed (or pasted) in Latitude and Longitude puts the map there. While the map is
  // flying, or when the fields already say where the map is, nothing moves; a half-typed number is not a point and is skipped.
  const lat = position?.latitude;
  const lng = position?.longitude;
  useEffect(() => {
    const m = map.current;
    if (!m || !ready || programmatic.current) return;
    const point = lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : null;
    if (!placed(point)) return;
    const c = m.getCenter();
    if (Math.abs(c.lat - point.latitude) < EPSILON && Math.abs(c.lng - point.longitude) < EPSILON) return;
    programmatic.current = true;
    pin.current?.dismissHint();
    m.jumpTo({ center: [point.longitude, point.latitude], zoom: Math.max(m.getZoom(), 14) });
  }, [lat, lng, ready]);

  if (failed) return <div className="grid h-full place-items-center bg-card p-4 text-center text-xs text-muted-foreground">{labels.failed}</div>;
  return (
    <div className="relative h-full w-full">
      <div ref={box} data-map-ready={ready ? '1' : '0'} className="h-full w-full overflow-hidden dark:[&_canvas]:invert dark:[&_canvas]:hue-rotate-180" />
      {/* The fixed pin: its bottom edge is half a ground dot below the centre, so the dot's centre is the centre pixel. */}
      <div ref={pinHost} aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 z-10" style={{ transform: `translate(-50%, calc(-100% + ${groundOffset}px))` }} />
    </div>
  );
}
