import type { ReactNode } from 'react';
import ReactSelect from 'react-select';

export type SelectOption<V extends string | number> = { value: V; label: string; icon?: ReactNode };

type Props<V extends string | number> = {
  options: SelectOption<V>[];
  value: V | null | undefined;
  onChange: (value: V) => void;
  /** Classes for the outer box, e.g. a width. */
  className?: string;
  ariaLabel?: string;
  /** A search box in the list; worth it when there are many options. */
  searchable?: boolean;
  placeholder?: string;
  /** Smaller text and padding, for toolbars and headers. */
  compact?: boolean;
};

/**
 * The one dropdown the apps use (react-select, unstyled, drawn with the same tokens as the
 * inputs). Takes plain `{ value, label }` options and reports the chosen value, not an event.
 */
export function Select<V extends string | number>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
  searchable = false,
  placeholder,
  compact = false,
}: Props<V>) {
  const text = compact ? 'text-xs' : 'text-sm';
  return (
    <ReactSelect<SelectOption<V>, false>
      unstyled
      isSearchable={searchable}
      aria-label={ariaLabel}
      placeholder={placeholder}
      options={options}
      value={options.find((o) => o.value === value) ?? null}
      onChange={(option) => option && onChange(option.value)}
      menuPlacement="auto"
      formatOptionLabel={(o) => (
        <span className="flex items-center gap-2">
          {o.icon}
          {o.label}
        </span>
      )}
      classNames={{
        container: () => `${className ?? ''} min-w-[6rem]`,
        control: ({ isFocused }) =>
          `flex cursor-pointer items-center rounded-md border bg-background ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} ${text} ${
            isFocused ? 'border-ring ring-1 ring-ring' : 'border-input'
          }`,
        valueContainer: () => 'gap-1',
        singleValue: () => 'truncate',
        placeholder: () => 'text-muted-foreground',
        input: () => 'text-foreground',
        indicatorsContainer: () => 'pl-1 text-muted-foreground',
        indicatorSeparator: () => 'hidden',
        menu: () => `z-50 mt-1 overflow-hidden rounded-md border border-border bg-card ${text}`,
        menuList: () => 'max-h-60 overflow-y-auto',
        option: ({ isFocused, isSelected }) =>
          `cursor-pointer px-3 py-1.5 ${isSelected ? 'bg-accent font-medium' : isFocused ? 'bg-accent/60' : ''}`,
        noOptionsMessage: () => 'px-3 py-2 text-muted-foreground',
      }}
    />
  );
}
