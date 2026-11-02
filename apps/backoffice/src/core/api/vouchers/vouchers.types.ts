/** Whether staff published the voucher. Whether it can be claimed or used right now also depends on its window (see `is_live`). */
export type VoucherStatus = 'active' | 'inactive';

/** How a customer gets it: a public voucher sits in every wallet while it is live, a coded one is claimed by typing its code (or sent by staff). */
export type VoucherType = 'public' | 'code';

/** Money off an order: a percentage of it (with a cap), or a fixed amount of rupiah. */
export type VoucherDiscountType = 'percentage' | 'amount';

export type VoucherOutlet = { id: number; name: string };
export type VoucherService = { id: number; name: string };

export type Voucher = {
  id: number;
  title: string;
  description: string;
  /** Head office's private note; never sent to the customer app. */
  internal_notes: string;
  /** The colour of the coupon stub in the app, "#RRGGBB". */
  color: string;
  /** An optional picture (what the upload gave); empty for none. */
  image_url: string;
  /** What a customer types to claim it; empty for a public voucher. */
  code: string;
  type: VoucherType;
  discount_type: VoucherDiscountType;
  /** A percentage (1–100) or whole rupiah, per `discount_type`. */
  value: number;
  /** The most a percentage discount takes off, in rupiah; 0 is no cap. */
  max_discount: number;
  /** The least an order must come to for it to apply, in rupiah; 0 is none. */
  min_spend: number;
  /** How many customers may claim it; 0 is no limit. Coded vouchers only. */
  max_claims: number;
  claims_count: number;
  /** How many times one customer may spend it. */
  usage_limit: number;
  status: VoucherStatus;
  /** When it starts and stops being usable; null at either end means no limit there. */
  starts_at: string | null;
  ends_at: string | null;
  /** The outlets it can be used at; empty means every outlet. */
  outlets: VoucherOutlet[];
  outlet_ids: number[];
  /** The services it applies to; empty means every service. */
  services: VoucherService[];
  service_ids: number[];
  /** Published and the server's clock inside the window. */
  is_live: boolean;
  created_at: string;
  updated_at: string;
};

/** Why a voucher can or cannot be used: the badge that explains an active voucher nobody can use. */
export type VoucherLiveState = 'live' | 'scheduled' | 'ended' | 'off';

/** Where a voucher's window stands against the clock, whatever its status. */
export type VoucherPeriod = 'running' | 'upcoming' | 'ended' | 'unlimited';

export type VouchersParams = {
  q?: string;
  status?: VoucherStatus | '';
  period?: VoucherPeriod | '';
  discount_type?: VoucherDiscountType | '';
  outlet_id?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  limit: number;
  offset: number;
};

/** What a voucher is created or updated with: what staff set (the id, the counts, `is_live` and the names are the server's). */
export type VoucherBody = Pick<Voucher, 'title' | 'description' | 'internal_notes' | 'color' | 'image_url' | 'code' | 'type' | 'discount_type' | 'value' | 'max_discount' | 'min_spend' | 'max_claims' | 'usage_limit' | 'status'> & {
  starts_at: string | null;
  ends_at: string | null;
  outlet_ids: number[];
  service_ids: number[];
};

/** One customer's copy of a voucher: put in their wallet by a claim or by staff. Name and phone are as they were when it was granted. */
export type VoucherHolder = {
  id: number;
  voucher_id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  /** How it got there: the customer claimed it, or staff sent it. */
  source: 'claim' | 'inject';
  granted_by: string;
  granted_at: string;
  /** When this copy stops working; null means when the voucher ends. */
  expires_at: string | null;
  uses_remaining: number;
};

export type HoldersParams = { q?: string; limit: number; offset: number };
