import type { GeocodeLanguage, GeocodeResult, ReverseResult } from './geocode.types';

// OpenStreetMap's public geocoder (Nominatim): no key, but a usage policy to keep — at most one request a second, a
// real identity (the browser sends the page's own origin as Referer) and no heavy use. Every call goes through `slot`,
// which spaces them out, and the callers debounce on top of that.
const BASE = 'https://nominatim.openstreetmap.org';
const MIN_GAP_MS = 1100;

let nextFree = 0;
/** Waits for this call's turn: calls leave at least `MIN_GAP_MS` apart, however many are asked for at once. */
async function slot(signal?: AbortSignal) {
  const now = Date.now();
  const at = Math.max(now, nextFree);
  nextFree = at + MIN_GAP_MS;
  if (at <= now) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, at - now);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

async function get<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  await slot(signal);
  const res = await fetch(`${BASE}${path}?${new URLSearchParams(params)}`, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`geocoder ${res.status}`);
  return (await res.json()) as T;
}

type NominatimPlace = { place_id: number; lat: string; lon: string; display_name: string };

/** Places in Indonesia that match what was typed: five at most. */
export async function searchPlaces(q: string, language: GeocodeLanguage, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const places = await get<NominatimPlace[]>('/search', { format: 'jsonv2', q, countrycodes: 'id', limit: '5', 'accept-language': language }, signal);
  return places
    .map((p) => ({ id: p.place_id, label: p.display_name, latitude: Number(p.lat), longitude: Number(p.lon) }))
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
}

/** The address at a point, or null when there is none there (open water, say). */
export async function reversePlace(latitude: number, longitude: number, language: GeocodeLanguage, signal?: AbortSignal): Promise<ReverseResult | null> {
  const place = await get<{ display_name?: string; error?: string; address?: { state?: string; 'ISO3166-2-lvl4'?: string } }>(
    '/reverse',
    { format: 'jsonv2', lat: String(latitude), lon: String(longitude), zoom: '18', addressdetails: '1', 'accept-language': language },
    signal,
  );
  return place.display_name ? { label: place.display_name, state: place.address?.state, isoCode: place.address?.['ISO3166-2-lvl4'] } : null;
}
