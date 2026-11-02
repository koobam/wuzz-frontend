import { ApiResponse } from '@http/response';

/** Service category filter for GET /services (service_category query param). */
export type ServiceCategory = 'regular' | 'alacarte';

export type LaundryServicesResponse = ApiResponse<LaundryServicesData>;

export type LaundryServiceDetailResponse = ApiResponse<LaundryServiceDetail>;

/** Error payload from laundry service detail API (for UI: title + description). */
export interface LaundryServiceDetailErrorData {
  image: string;
  title: string;
  description: string;
}

/** Error response shape when laundry service detail fails (data holds user-facing copy). */
export type LaundryServiceDetailErrorResponse = ApiResponse<LaundryServiceDetailErrorData>;

export interface LaundryServicesData {
  services: LaundryService[];
}

export interface LaundryServiceAddon {
  id: number;
  name: string;
  description: string;
  price: number;
  unit?: string;
  discount: number;
  discount_type: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LaundryService {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  service_type: string;
  service_category: ServiceCategory;
  min_kg?: number;
  max_kg?: number;
  discount: number;
  discount_type: string;
  icon: string;
  /** The icon as a picture uploaded in the back office; when set, it is drawn instead of `icon`. */
  icon_url?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

/** A group of addons in the service detail (GET /services/:id). */
export interface LaundryServiceSection {
  title: string;
  description: string;
  /** `multiple` = pick many, `single` = pick one. */
  type: 'multiple' | 'single';
  addons: LaundryServiceAddon[];
}

/** Pricing for a specific tier (nested inside a tier in GET /services/:id). */
export interface LaundryServiceTierPricing {
  id: number;
  service_id: number;
  tier_id: number;
  sku: string;
  estimated_time: number;
  estimated_time_unit: string;
  price: number;
  discount: number;
  discount_type: string;
  unit: string;
}

/** A service tier (e.g. Reguler/Express) with its pricing. */
export interface LaundryServiceTier {
  id: number;
  code: string;
  name: string;
  sort_order: number;
  pricing?: LaundryServiceTierPricing;
}

/** Full service detail (GET /services/:id): base fields + tiers + addon sections. */
export interface LaundryServiceDetail extends LaundryService {
  tiers?: LaundryServiceTier[];
  sections?: LaundryServiceSection[];
}

export interface LaundryServicesParams {
  num?: number;
  include_tiers?: boolean;
}
