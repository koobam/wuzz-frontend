// Soft colours for the avatars, picked from the id so a person keeps theirs.
const TINTS = ['#fde2cf', '#d9ecff', '#e3f6d8', '#f3dcff', '#fff0b8', '#ffd9de'];

export function tint(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

/** A round avatar with the person's initials; `online` adds the green dot. */
export function Avatar({ id, name, size = 32, online = false }: { id: string; name: string; size?: number; online?: boolean }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full font-medium text-neutral-800"
      style={{ width: size, height: size, backgroundColor: tint(id), fontSize: Math.round(size * 0.34) }}
    >
      {initials(name)}
      {online ? <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card bg-green-500" aria-hidden /> : null}
    </span>
  );
}
