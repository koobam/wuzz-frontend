export type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371.0088;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Straight-line ("as the crow flies") distance between two points, in kilometres (haversine). Not a road distance. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The closest of `others` to `from`, with how far it is; null when there is none. */
export function nearest<T extends LatLng>(from: LatLng, others: T[]): { item: T; km: number } | null {
  let best: { item: T; km: number } | null = null;
  for (const item of others) {
    const km = distanceKm(from, item);
    if (!best || km < best.km) best = { item, km };
  }
  return best;
}

/** "850 m" under a kilometre, "3,2 km" above it, in the reader's number format. */
export function formatDistance(km: number, language: string): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(km)} km`;
}
