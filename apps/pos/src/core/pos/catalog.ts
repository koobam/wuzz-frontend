import { getCatalog } from '@/core/api';
import type { Catalog } from './types';

/**
 * The outlet, its categories and its price list, from the server. The POS is online-only, so there is no copy on the device to fall
 * back on: if this fails the page says so and offers to try again, rather than selling from prices that may be out of date.
 */
export async function loadCatalog(): Promise<Catalog> {
  const fresh = await getCatalog();
  return {
    outlets: fresh.outlets.map((o) => ({ id: o.id, name: o.name, address: o.address })),
    services: fresh.services.map((s) => ({
      id: s.id,
      name: s.name,
      unit: s.unit,
      price: s.price,
      categoryId: s.category_id,
      icon: s.icon,
      description: s.description,
      // Only the options head office has switched on are offered.
      variantGroups: (s.variant_groups ?? [])
        .map((g) => ({ id: g.id, name: g.name, options: g.options.filter((o) => o.active).map((o) => ({ id: o.id, name: o.name, delta: o.price_delta, isDefault: o.is_default })) }))
        .filter((g) => g.options.length > 0),
      modifierGroups: (s.modifier_groups ?? [])
        .map((g) => ({ id: g.id, name: g.name, min: g.min, max: g.max, options: g.options.filter((o) => o.active).map((o) => ({ id: o.id, name: o.name, price: o.price })) }))
        .filter((g) => g.options.length > 0),
    })),
    categories: fresh.categories,
  };
}
