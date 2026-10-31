import type { LucideIcon } from 'lucide-react';

/** One figure of the dashboard: a label, a number, and an icon; `highlight` paints it in the brand gradient. */
export function Tile({
  label,
  value,
  note,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: number | undefined;
  note?: string;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  const soft = highlight ? 'text-white/85' : 'text-muted-foreground';
  return (
    <div className={`flex h-full flex-col justify-between gap-5 rounded-3xl p-5 ${highlight ? 'bg-linear-to-br from-[#f8895c] to-[#e2483d] text-white' : 'border border-border bg-card'}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${soft}`}>{label}</span>
        <span className={`grid size-9 place-items-center rounded-full ${highlight ? 'bg-white/20' : 'bg-muted'}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <div>
        <div className="text-4xl font-semibold tracking-tight">{value ?? '–'}</div>
        {note ? <div className={`mt-1 text-xs ${soft}`}>{note}</div> : null}
      </div>
    </div>
  );
}

