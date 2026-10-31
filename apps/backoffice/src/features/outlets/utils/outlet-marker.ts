/**
 * The outlet marker of the customer app, drawn for the web (flat, no shadow): the outlet's photo in a rounded square with a
 * thick border and a small pointer under it whose tip is the exact coordinate (the map puts the marker's bottom edge on the
 * point). The border and the pointer are off-white, and the primary blue for the chosen outlet. A switched-off outlet is shown
 * in grey (the app has no such state; the admin needs it); one with no photo gets a shop icon on a plain square. It is a
 * focusable button with the outlet's name, and the photo lifts a little when pointed at.
 */
import { isShownImage } from './outlet-form.schema';

export const MARKER_SIZE = 55;
const POINTER_HEIGHT = 10;
const POINTER_OVERLAP = 3;
const RADIUS = 14;
const BORDER = 4;
/** A real white, so the border reads on the map in dark mode too; the chosen outlet gets the app's primary blue (`theme.pallate.primary['03']`). */
const WHITE = '#FFFFFF';
const SELECTED = '#0009FF';
const OFF = '#BDBDBD';

/** Height of the whole marker: the square and the part of the pointer that shows below it. */
export const MARKER_HEIGHT = MARKER_SIZE + POINTER_HEIGHT - POINTER_OVERLAP;

export function createOutletMarker({ name, image, selected, active }: { name: string; image: string; selected: boolean; active: boolean }) {
  const accent = selected ? SELECTED : active ? WHITE : OFF;

  const el = document.createElement('button');
  el.type = 'button';
  el.setAttribute('aria-label', name);
  el.style.cssText = `width:${MARKER_SIZE}px;height:${MARKER_HEIGHT}px;padding:0;border:0;background:none;cursor:pointer;outline-offset:3px`;

  const body = document.createElement('span');
  body.style.cssText = 'position:absolute;inset:0;transition:transform .15s ease-out';

  const frame = document.createElement('span');
  frame.style.cssText = `position:absolute;left:0;top:0;width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;box-sizing:border-box;overflow:hidden;border-radius:${RADIUS}px;border:${BORDER}px solid ${accent};background:#e5e7eb;display:grid;place-items:center`;
  frame.style.setProperty('corner-shape', 'squircle'); // the app's continuous corners, where the browser has them

  // No photo (or it did not load): a plain square with a shop, inside the same border.
  const fallback = () => {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('width', '24');
    icon.setAttribute('height', '24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', '#6b7280');
    icon.setAttribute('stroke-width', '2');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    for (const d of ['m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7', 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4', 'M2 7h20', 'M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7']) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      icon.append(path);
    }
    frame.replaceChildren(icon);
  };
  if (isShownImage(image)) {
    const photo = document.createElement('img');
    photo.alt = '';
    photo.decoding = 'async';
    photo.loading = 'lazy';
    photo.style.cssText = `width:100%;height:100%;object-fit:cover;${active ? '' : 'filter:grayscale(1);opacity:.75'}`;
    photo.onerror = fallback;
    photo.src = image;
    frame.append(photo);
  } else fallback();

  // The pointer: the app's polygon (20,44) (35,44) (27.5,54) in a 55x55 box, as a 15x10 triangle centred under the square.
  const pointer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  pointer.setAttribute('width', '15');
  pointer.setAttribute('height', String(POINTER_HEIGHT));
  pointer.setAttribute('viewBox', `0 0 15 ${POINTER_HEIGHT}`);
  pointer.style.cssText = `position:absolute;left:${(MARKER_SIZE - 15) / 2}px;top:${MARKER_SIZE - POINTER_OVERLAP}px;overflow:visible`;
  const tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  tri.setAttribute('points', `0,0 15,0 7.5,${POINTER_HEIGHT}`);
  tri.setAttribute('fill', accent);
  pointer.append(tri);

  body.append(frame, pointer);
  el.append(body);
  el.addEventListener('mouseenter', () => (body.style.transform = 'translateY(-4px)'));
  el.addEventListener('mouseleave', () => (body.style.transform = ''));
  return el;
}
