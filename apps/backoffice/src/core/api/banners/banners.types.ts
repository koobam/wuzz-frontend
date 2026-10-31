/** What tapping a banner opens in the customer app: nothing, one service, one outlet, one of the app's screens, or a web page. */
export type BannerTargetType = 'none' | 'service' | 'outlet' | 'screen' | 'external';

/** Whether staff published the banner. Whether it shows right now also depends on its schedule (see `is_live`). */
export type BannerStatus = 'active' | 'inactive';

export type BannerOutlet = { id: number; name: string };

export type Banner = {
  id: number;
  title: string;
  /** Head office's private note; never sent to the customer app. */
  internal_notes: string;
  /** The picture's address (what the upload gave). */
  image_url: string;
  target_type: BannerTargetType;
  /** The service's or outlet's id, the screen's name, or the web address (empty for `none`). */
  target_value: string;
  /** The link the app opens, built by the server from the target (`wuzz://laundry/12`, `https://…`); empty for `none`. */
  deeplink: string;
  status: BannerStatus;
  /** Its place in the carousel (set on the order page, never by the form). */
  sort_index: number;
  /** When it starts and stops showing; null at either end means no limit there. */
  starts_at: string | null;
  ends_at: string | null;
  /** The outlets it shows at; empty means every outlet. */
  outlets: BannerOutlet[];
  outlet_ids: number[];
  /** On a customer's phone right now: published, and the server's clock inside the window. */
  is_live: boolean;
  created_at: string;
  updated_at: string;
};

/** Why a banner is or is not showing: the badge that explains an active banner that nobody sees. */
export type BannerLiveState = 'live' | 'scheduled' | 'ended' | 'off';

/** What the banners list asks the server for. */
export type BannersParams = {
  q?: string;
  status?: BannerStatus | '';
  /** `true` = only the ones on a phone now, `false` = only the ones that are not. */
  live?: 'true' | 'false' | '';
  outlet_id?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  limit: number;
  offset: number;
};

/** What a banner is created or updated with: what staff set (the id, the deeplink, the order, `is_live` and the outlets' names are the server's). */
export type BannerBody = Pick<Banner, 'title' | 'internal_notes' | 'image_url' | 'target_type' | 'target_value' | 'status'> & {
  starts_at: string | null;
  ends_at: string | null;
  outlet_ids: number[];
};
