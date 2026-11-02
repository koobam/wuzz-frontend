import { createQueryKeys } from '@lukemorales/query-key-factory';
import { reversePlace, searchPlaces } from '@/core/api';
import type { GeocodeLanguage } from '@/core/api';

export const geocodeQueries = createQueryKeys('geocode', {
  search: (q: string, language: GeocodeLanguage) => ({
    queryKey: [q, language],
    queryFn: ({ signal }) => searchPlaces(q, language, signal),
  }),
  reverse: (latitude: number, longitude: number, language: GeocodeLanguage) => ({
    queryKey: [latitude, longitude, language],
    queryFn: ({ signal }) => reversePlace(latitude, longitude, language, signal),
  }),
});
