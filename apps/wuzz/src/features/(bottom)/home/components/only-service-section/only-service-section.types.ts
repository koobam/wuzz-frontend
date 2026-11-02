
export type OnlyServiceSectionProps = {
  title: string;
  subtitle: string;
  onServicePress: (id: number) => void;
  /** Override items (e.g. with onPress per item). Default: ONLY_SERVICE_ITEMS */
  items: OnlyServiceItem[];
  /** Draws placeholder cards while the services load and there is nothing to show yet. */
  isLoading?: boolean;
};

export type OnlyServiceCardProps = {
  item: OnlyServiceItem;
  onPress: () => void;
};

export type OnlyServiceItem = {
  id: number;
  name: string;
  description: string;
  serviceType: string; // e.g. 'satuan', 'express', etc. (used for navigation param)
  icon: string; // icon name from Icon component (default: 'bag')
  /** The picture uploaded for the service in the back office; drawn instead of `icon` when set. */
  iconUrl?: string;
  promo?: string; // e.g. '20%' or 'Free' (optional)
  /** Dipakai kartu ini kalau ada; kalau tidak, jatuh ke onServicePress. */
  onPress?: () => void;
};
