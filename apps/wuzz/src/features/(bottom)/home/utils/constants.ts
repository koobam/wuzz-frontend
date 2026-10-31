export const DOT_WIDTH_ACTIVE = 40;
export const DOT_WIDTH_INACTIVE = 10;

export type ProductAddOnType = 'single' | 'multiple';

export type OnlyServiceItem = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  promo?: string;
  /** Untuk navigasi ke layar laundry (dari API alacarte). */
  serviceType?: 'kiloan' | 'satuan';
  /** Jika diset, dipakai oleh kartu alih-alih onServicePress global. */
  onPress?: () => void;
};

export const ONLY_SERVICE_ITEMS: OnlyServiceItem[] = [];
