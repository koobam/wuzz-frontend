/** What an outlet sells: laundry, caffe, or both. */
export type OutletCategory = 'laundry' | 'caffe' | 'all';

/** How an order reaches the customer. */
export type DeliveryType = 'pickup' | 'delivery';

/** The three time zones of Indonesia an outlet can keep its hours in: WIB (UTC+7), WITA (UTC+8), WIT (UTC+9). */
export type OutletTimezone = 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura';
export type OutletTimezoneLabel = 'WIB' | 'WITA' | 'WIT';

/** One day of an outlet's week: `weekday` 0 is Monday and 6 Sunday; a closed day has no times and a 24-hour day has none to choose. A closing time before the opening time means it closes after midnight. */
export type OutletDay = { weekday: number; closed: boolean; /** Open all day (then the times are "00:00"; `closed` is false). Never both. */ open_24h: boolean; open_time: string; close_time: string };

export type Outlet = {
  id: number;
  name: string;
  address: string;
  phone: string;
  /** The outlet's contact email, lower case; empty when it has none. */
  email: string;
  latitude: number;
  longitude: number;
  active: boolean;
  /** The outlet's pictures (https); the first is its banner. */
  images: string[];
  category: OutletCategory;
  /** At least one of pickup and delivery. */
  delivery_types: DeliveryType[];
  /** The zone every time of `hours` is written in (and `timezone_label` its short name). */
  timezone: OutletTimezone;
  timezone_label: OutletTimezoneLabel;
  /** The whole week, always seven days, Monday first. */
  hours: OutletDay[];
  /** TODAY's range ("HH:MM", in the outlet's zone), empty when it is closed today. Worked out by the server. */
  open_time: string;
  close_time: string;
  /** Whether it is open right now, worked out by the server. */
  is_open_now: boolean;
};

/** A box on the map, in degrees. */
export type Area = { south: number; west: number; north: number; east: number };

/** What the outlets list asks the server for: a search, whether the outlet is open, an order and a page. */
export type OutletsParams = { q?: string; active?: 'true' | 'false' | ''; sort_by?: string; sort_dir?: 'asc' | 'desc'; limit: number; offset: number };
