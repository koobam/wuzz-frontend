/** The gap between a marker and its card. */
export const CARD_GAP = 8;
const MARGIN = 12;
const CARD_WIDTH = 240;
const BANNER_HEIGHT = 96;
/** The floating top bar covers this much of the top of the screen (5.25rem on a wide screen, 9.5rem when it wraps on a narrow one): a card never opens into it. */
const topBar = () => (window.innerWidth < 768 ? 152 : 90);

export type HoverCard = {
  root: HTMLElement;
  isOpen: () => boolean;
  /** Shows the card at `marker` (any element on screen) and keeps it there while `place` is called. */
  show: (marker: HTMLElement, mapBox: HTMLElement) => void;
  place: () => void;
  hide: () => void;
};

/**
 * The outlet's card over its marker. It is drawn in `document.body`, not inside the map, so nothing can cut it off or cover it
 * (the table card that overlaps the map's bottom edge, the gradient over the header, the floating top bar). It opens above the
 * marker's top edge (or below its tip when there is no room above), centred on the marker (leaning only as far as the screen
 * needs, the little arrow still pointing at the marker), and when neither side has room for all of it, it takes the side with
 * more room and shrinks its photo (then drops it) so the whole card is seen.
 */
export function createHoverCard(content: HTMLElement, { onOpen, onClose }: { onOpen?: () => void; onClose?: () => void } = {}): HoverCard {
  const root = document.createElement('div');
  root.className = 'outlet-hovercard';
  root.setAttribute('role', 'tooltip');
  const arrow = document.createElement('span');
  arrow.className = 'outlet-hovercard__arrow';
  arrow.setAttribute('aria-hidden', 'true');
  root.append(content, arrow);

  let target: HTMLElement | null = null;
  let area: HTMLElement | null = null;
  let open = false;

  const banner = content.querySelector<HTMLElement>('.outlet-card__banner');

  function place() {
    if (!open || !target) return;
    const mk = target.getBoundingClientRect();
    const box = area?.getBoundingClientRect();
    const cx = mk.left + mk.width / 2;
    // A marker panned off the map has no card.
    if (box && (cx < box.left || cx > box.right || mk.bottom < box.top || mk.top > box.bottom)) {
      root.style.visibility = 'hidden';
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(CARD_WIDTH, vw - MARGIN * 2);
    root.style.width = `${width}px`;
    if (banner) banner.style.height = `${BANNER_HEIGHT}px`;
    if (banner) banner.style.display = '';
    let height = root.offsetHeight;
    const above = mk.top - CARD_GAP - topBar();
    const below = vh - MARGIN - (mk.bottom + CARD_GAP);
    const side: 'above' | 'below' = height <= above ? 'above' : height <= below ? 'below' : above >= below ? 'above' : 'below';
    const room = side === 'above' ? above : below;
    if (height > room && banner) {
      // Not even the better side has room for the whole card: the photo gives way first.
      const shrink = Math.min(BANNER_HEIGHT, height - room);
      if (shrink >= BANNER_HEIGHT - 24) banner.style.display = 'none';
      else banner.style.height = `${BANNER_HEIGHT - shrink}px`;
      height = root.offsetHeight;
    }
    const left = Math.min(Math.max(cx - width / 2, MARGIN), vw - width - MARGIN);
    const top = side === 'above' ? mk.top - CARD_GAP - height : mk.bottom + CARD_GAP;
    root.dataset.side = side;
    root.style.left = `${Math.round(left)}px`;
    root.style.top = `${Math.round(top)}px`;
    // The arrow stays on the marker's centre line even when the card leans to keep inside the screen.
    arrow.style.left = `${Math.round(Math.min(Math.max(cx - left, 18), width - 18))}px`;
    root.style.visibility = 'visible';
  }

  return {
    root,
    isOpen: () => open,
    show(marker, mapBox) {
      target = marker;
      area = mapBox;
      if (!open) {
        open = true;
        root.style.visibility = 'hidden';
        document.body.append(root);
        onOpen?.();
      }
      place();
    },
    place,
    hide() {
      if (!open) return;
      open = false;
      root.remove();
      onClose?.();
    },
  };
}
