/** The catalog as the server sends it: this till's outlet, the services it sells (only some options active) and their categories. */
export type ServerCatalog = {
  outlets: { id: number; name: string; address: string }[];
  services: { id: number; name: string; unit: string; price: number; category_id: number;
    icon: string;
    description: string;
    variant_groups: { id: number; name: string; options: { id: number; name: string; price_delta: number; is_default: boolean; active: boolean }[] }[];
    modifier_groups: { id: number; name: string; min: number; max: number | null; options: { id: number; name: string; price: number; active: boolean }[] }[];
  }[];
  categories: { id: number; name: string; icon: string }[];
};
