import type { ReactNode } from 'react';
import ReactSelect from 'react-select';
import { useControlShape, usePortalTarget } from '../../utils/portal-target';

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
  /** The id of the text box inside, so a `<label htmlFor>` (see `Field`) names it. */
  inputId?: string;
  /** `field` matches a form's text box (`Input` shape field); `pill` is the toolbar's. */
  shape?: 'pill' | 'field';
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
  inputId,
  shape: shapeProp,
}: Props<V>) {
  const portalTarget = usePortalTarget();
  // Inside a form `Field` the select takes the form's shape on its own; `shape` overrides it.
  const inherited = useControlShape();
  const shape = shapeProp ?? inherited;
  const text = compact ? 'text-xs' : 'text-sm';
  return (
    <ReactSelect<SelectOption<V>, false>
      unstyled
      isSearchable={searchable}
      aria-label={ariaLabel}
      inputId={inputId}
      placeholder={placeholder}
      options={options}
      value={options.find((o) => o.value === value) ?? null}
      onChange={(option) => option && onChange(option.value)}
      menuPlacement="auto"
      // Drawn on the page itself, not inside the box the select sits in: a table card clips, and a sticky header would
      // otherwise be painted over the list.
      menuPortalTarget={portalTarget ?? (typeof document === 'undefined' ? undefined : document.body)}
      menuPosition="fixed"
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
      formatOptionLabel={(o) => (
        <span className="flex items-center gap-2">
          {o.icon}
          {o.label}
        </span>
      )}
      classNames={{
        container: () => `${className ?? ''} min-w-[6rem]`,
        control: ({ isFocused }) =>
          `flex cursor-pointer items-center border bg-card ${shape === 'field' ? 'rounded-xl px-4 py-3' : `rounded-full ${compact ? 'px-3 py-1.5' : 'px-4 py-2'}`} ${text} ${
            isFocused ? 'border-ring ring-1 ring-ring' : 'border-input'
          }`,
        valueContainer: () => 'gap-1',
        singleValue: () => 'truncate',
        placeholder: () => 'text-muted-foreground',
        input: () => 'text-foreground',
        indicatorsContainer: () => 'pl-1 text-muted-foreground',
        indicatorSeparator: () => 'hidden',
        menu: () => `z-50 mt-1 overflow-hidden rounded-2xl border border-border bg-card p-1 ${text}`,
        menuList: () => 'max-h-60 overflow-y-auto',
        option: ({ isFocused, isSelected }) =>
          `cursor-pointer rounded-xl px-3 py-1.5 ${isSelected ? 'bg-accent font-medium' : isFocused ? 'bg-accent/60' : ''}`,
        noOptionsMessage: () => 'px-3 py-2 text-muted-foreground',
      }}
    />
  );
}
