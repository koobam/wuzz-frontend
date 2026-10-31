import { createContext, useContext } from 'react';

/**
 * Where a dropdown menu is drawn. By default that is the page (`document.body`), but a modal (`<dialog>`) sits above the
 * whole page, so a menu opened inside one must be drawn inside it. `Modal` provides itself here; `Select` reads it.
 */
export const PortalTargetContext = createContext<HTMLElement | null>(null);
export const usePortalTarget = () => useContext(PortalTargetContext);

/**
 * The shape of the controls in the place they are drawn: `field` inside a form `Field` (the same rounded box as an
 * `Input`), `pill` anywhere else (a toolbar, a filter). A `Select` reads it, so a form never mixes the two.
 */
export const ControlShapeContext = createContext<'pill' | 'field'>('pill');
export const useControlShape = () => useContext(ControlShapeContext);
