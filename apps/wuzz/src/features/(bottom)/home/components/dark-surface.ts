import { theme } from '@components/atoms';

/**
 * The home screen's dark cards are never flat black: they fade from a soft charcoal in the top left to the palette's
 * near-black in the bottom right. Used as the `colors` of a LinearGradient with DARK_GRADIENT_START and _END.
 */
export const DARK_GRADIENT_COLORS = ['#3D3D3D', theme.pallate.neutral['05']] as const;
export const DARK_GRADIENT_START = { x: 0, y: 0 } as const;
export const DARK_GRADIENT_END = { x: 1, y: 1 } as const;
