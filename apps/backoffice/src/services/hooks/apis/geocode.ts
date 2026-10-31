import { useQuery } from '@tanstack/react-query';
import type { GeocodeLanguage } from '@/core/api';
import { queries } from '@/services/queries';

const FIVE_MINUTES = 5 * 60_000;
export const MIN_SEARCH_LENGTH = 3;

/** The places that match an address typed so far (nothing until it is long enough); the same words are not asked twice. */
export const useGeocodeSearch = (q: string, language: GeocodeLanguage) =>
  useQuery({ ...queries.geocode.search(q, language), enabled: q.length >= MIN_SEARCH_LENGTH, staleTime: FIVE_MINUTES, retry: false });

/** The address at a point (rounded to ~1 m so a nudge of the pin is not a new question); null coordinates ask nothing. */
export const useReverseGeocode = (point: { latitude: number; longitude: number } | null, language: GeocodeLanguage) => {
  const latitude = point ? Math.round(point.latitude * 1e5) / 1e5 : 0;
  const longitude = point ? Math.round(point.longitude * 1e5) / 1e5 : 0;
  return useQuery({ ...queries.geocode.reverse(latitude, longitude, language), enabled: point !== null, staleTime: FIVE_MINUTES, retry: false });
};
