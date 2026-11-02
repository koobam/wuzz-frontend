import { z } from 'zod';
import { isDecimal } from '@wuzz/web-ui';
import { MATERIAL_CATEGORIES, MATERIAL_UNITS, type Material, type MaterialBody, type MaterialCategory, type MaterialUnit } from '@/core/api';

type T = (key: string) => string;

/**
 * What the material form asks for. The purchase quantity is an exact decimal and stays TEXT all the way to the server
 * (at most 4 places, above zero): the cost of a unit is the exact fraction price / quantity, so nothing here may turn it
 * into a float.
 */
export const materialSchema = (t: T) =>
  z.object({
    sku: z.string().trim().min(1, t('materials.form.skuRequired')).max(40),
    name: z.string().trim().min(1, t('materials.form.nameRequired')).max(80),
    category: z.custom<MaterialCategory>((v) => MATERIAL_CATEGORIES.includes(v as MaterialCategory)),
    unit: z.custom<MaterialUnit>((v) => MATERIAL_UNITS.includes(v as MaterialUnit)),
    purchase_price: z.number({ error: t('materials.form.priceInvalid') }).min(0, t('materials.form.priceInvalid')),
    purchase_qty: z.string().refine((v) => isDecimal(v, 4) && Number(v) > 0, t('materials.invalidQty')),
    active: z.boolean(),
    notes: z.string(),
  });
export type MaterialValues = z.infer<ReturnType<typeof materialSchema>>;

export const blankMaterial = (): MaterialValues => ({ sku: '', name: '', category: 'chemical', unit: 'ml', purchase_price: 0, purchase_qty: '', active: true, notes: '' });

export const materialValues = (m: Material): MaterialValues => ({
  sku: m.sku,
  name: m.name,
  category: m.category,
  unit: m.unit,
  purchase_price: m.purchase_price,
  purchase_qty: m.purchase_qty,
  active: m.active,
  notes: m.notes,
});

/** The body the server takes: the price is whole rupiah. */
export const materialBody = (v: MaterialValues): MaterialBody => ({ ...v, purchase_price: Math.round(v.purchase_price) });
