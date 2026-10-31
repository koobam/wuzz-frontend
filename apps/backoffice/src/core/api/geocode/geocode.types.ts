/** One place the address search found. */
export type GeocodeResult = {
  id: number;
  /** The whole address as OpenStreetMap writes it. */
  label: string;
  latitude: number;
  longitude: number;
};

/** The address at a point, when OpenStreetMap knows one: the whole address, and the province and its ISO 3166-2 code when it names them. */
export type ReverseResult = { label: string; state?: string; isoCode?: string };

export type GeocodeLanguage = 'id' | 'en';
