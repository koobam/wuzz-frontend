import { Search } from 'lucide-react';
import { inputClass } from '../../styles/tokens';
import { FilterField } from '../filter-field';

/** The search field of a list's toolbar, with its label above. It stretches (`flex-1`) so it lines up with the filters next to it. */
export function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <FilterField label={label} className="min-w-48">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} maxLength={64} className={`${inputClass} w-full pl-10`} />
      </div>
    </FilterField>
  );
}
