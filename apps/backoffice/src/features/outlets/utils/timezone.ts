import type { OutletTimezone, OutletTimezoneLabel } from '@/core/api';

export type TimezoneGuess = {
  timezone: OutletTimezone;
  label: OutletTimezoneLabel;
  /** `province`: read from the place's province (exact, the border follows the province); `longitude`: estimated from the coordinate. */
  source: 'province' | 'longitude';
  /** The province the zone was read from, as the geocoder wrote it (only when `source` is `province`). */
  province?: string;
};

const ZONES: Record<OutletTimezoneLabel, OutletTimezone> = { WIB: 'Asia/Jakarta', WITA: 'Asia/Makassar', WIT: 'Asia/Jayapura' };

/**
 * Indonesia's three zones follow PROVINCE borders, not meridians: Central Kalimantan is WIB while South Kalimantan, a few
 * kilometres east, is WITA; the island of Sumbawa is WITA while Java next door is WIB. So when the province is known it
 * decides. Names come in the spellings OpenStreetMap uses in either language; the ISO 3166-2 codes (`ID-JK`...) work too.
 */
const PROVINCES: Record<OutletTimezoneLabel, string[]> = {
  WIB: [
    'aceh', 'sumatera utara', 'north sumatra', 'sumatera barat', 'west sumatra', 'riau', 'kepulauan riau', 'riau islands', 'jambi',
    'sumatera selatan', 'south sumatra', 'bengkulu', 'kepulauan bangka belitung', 'bangka belitung', 'bangka belitung islands', 'lampung',
    'banten', 'dki jakarta', 'jakarta', 'daerah khusus ibukota jakarta', 'daerah khusus ibu kota jakarta', 'special capital region of jakarta',
    'jawa barat', 'west java', 'jawa tengah', 'central java', 'di yogyakarta', 'yogyakarta', 'daerah istimewa yogyakarta', 'special region of yogyakarta',
    'jawa timur', 'east java', 'kalimantan barat', 'west kalimantan', 'kalimantan tengah', 'central kalimantan',
    'id-ac', 'id-su', 'id-sb', 'id-ri', 'id-kr', 'id-ja', 'id-ss', 'id-be', 'id-bb', 'id-la', 'id-bt', 'id-jk', 'id-jb', 'id-jt', 'id-yo', 'id-ji', 'id-kb', 'id-kt',
  ],
  WITA: [
    'bali', 'nusa tenggara barat', 'west nusa tenggara', 'nusa tenggara timur', 'east nusa tenggara', 'kalimantan selatan', 'south kalimantan',
    'kalimantan timur', 'east kalimantan', 'kalimantan utara', 'north kalimantan', 'sulawesi utara', 'north sulawesi', 'gorontalo',
    'sulawesi tengah', 'central sulawesi', 'sulawesi barat', 'west sulawesi', 'sulawesi selatan', 'south sulawesi', 'sulawesi tenggara', 'southeast sulawesi',
    'id-ba', 'id-nb', 'id-nt', 'id-ks', 'id-ki', 'id-ku', 'id-sa', 'id-go', 'id-st', 'id-sr', 'id-sn', 'id-sg',
  ],
  WIT: [
    'maluku', 'maluku utara', 'north maluku', 'papua', 'papua barat', 'west papua', 'papua barat daya', 'southwest papua', 'south west papua',
    'papua selatan', 'south papua', 'papua tengah', 'central papua', 'papua pegunungan', 'highland papua', 'mountain papua',
    'id-ma', 'id-mu', 'id-pa', 'id-pb', 'id-pd', 'id-ps', 'id-pt', 'id-pe',
  ],
};

/** A province name reduced to what the lists above are written in: no accents or case, no "Provinsi"/"Province of" and no stray punctuation. */
const clean = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\b(provinsi|province of|province)\b/g, ' ')
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const INDEX = new Map<string, OutletTimezoneLabel>();
for (const [label, names] of Object.entries(PROVINCES) as [OutletTimezoneLabel, string[]][]) for (const n of names) INDEX.set(n, label);

/** The zone of a province (or ISO 3166-2 code), or undefined when it is not one we know. */
export const zoneOfProvince = (province: string | undefined): OutletTimezoneLabel | undefined => (province ? INDEX.get(clean(province)) : undefined);

/** Where the borders between the zones cross the map, in degrees east: west of the first is WIB, between them WITA, east of the second WIT. */
const WITA_STARTS_AT = 114.5;
const WIT_STARTS_AT = 127;

/**
 * The time zone of a place in Indonesia. The province wins when it is known (that is how the zones are drawn). Without it
 * the longitude gives a good estimate (WIB < 114.5°E ≤ WITA < 127°E ≤ WIT) that can be wrong within a few tens of kilometres of
 * a border, which is why the form refines it once the geocoder has named the province.
 */
export function timezoneForPoint({ longitude }: { latitude: number; longitude: number }, province?: string): TimezoneGuess {
  const known = zoneOfProvince(province);
  if (known) return { timezone: ZONES[known], label: known, source: 'province', province };
  const label: OutletTimezoneLabel = longitude < WITA_STARTS_AT ? 'WIB' : longitude < WIT_STARTS_AT ? 'WITA' : 'WIT';
  return { timezone: ZONES[label], label, source: 'longitude' };
}
