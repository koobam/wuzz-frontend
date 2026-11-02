import IcoMoonModule from 'react-icomoon';
import { Car, Footprints, House, Shirt, Sparkles, WashingMachine, type LucideIcon } from 'lucide-react';
// The customer app's own icon set (apps/wuzz/public/icons/selection.json): the same glyphs, drawn from the same file.
import appIcons from '../../assets/icons/selection.json';

// react-icomoon is a CommonJS module: depending on the bundler, its default export arrives either as the component or as
// `{ default: component }`. Take whichever it is.
type IcoMoonComponent = typeof IcoMoonModule;
const IcoMoon = ((IcoMoonModule as unknown as { default?: IcoMoonComponent }).default ?? IcoMoonModule) as IcoMoonComponent;

/** The names the app's set draws: the icon of a service (kiloan, wash, dry, fold, bed, bag, iron). */
const APP_ICONS = new Set((appIcons as { icons: { properties: { name: string } }[] }).icons.map((i) => i.properties.name));

/** The categories services are grouped in are not in the app, so they use the line icons of the web apps. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  shirt: Shirt,
  'washing-machine': WashingMachine,
  house: House,
  footprints: Footprints,
  car: Car,
};

/**
 * An icon the catalog names: a service's icon is the app's own glyph; a category's is a line icon. A name nobody has
 * drawn yet gets a neutral sparkle rather than nothing. A line icon is sized by `className`, an app glyph by `size`.
 */
export function CatalogIcon({ name, className, size }: { name: string; className?: string; size?: number }) {
  const cls = className ?? 'size-4';
  if (APP_ICONS.has(name)) {
    // The size is given in pixels, not by a class: the library sets it inline, which a class cannot override. The
    // app's glyphs also leave a wide margin round the picture, so callers draw them bigger than their circle and let
    // the circle (overflow-hidden) trim the margin.
    return <IcoMoon iconSet={appIcons} icon={name} size={size ?? 16} color="currentColor" className="max-w-none shrink-0" aria-hidden />;
  }
  const Icon = CATEGORY_ICONS[name] ?? Sparkles;
  return <Icon className={cls} aria-hidden />;
}
