import ReactSelect from 'react-select';
import { useControlShape, usePortalTarget } from '../../utils/portal-target';
import type { SelectOption } from '../select';

/**
 * `Select` for several values (react-select, unstyled, the same tokens): the chosen ones are chips with a remove button, the list
 * stays open between picks, and the list is searchable. Reports the whole chosen set, in the order it was picked.
 */
export function MultiSelect<V extends string | number>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
  placeholder,
  inputId,
  noOptionsText,
  disabled = false,
  loading = false,
  shape: shapeProp,
}: {
  options: SelectOption<V>[];
  value: V[];
  onChange: (value: V[]) => void;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  inputId?: string;
  noOptionsText?: string;
  disabled?: boolean;
  loading?: boolean;
  shape?: 'pill' | 'field';
}) {
  const portalTarget = usePortalTarget();
  const inherited = useControlShape();
  const shape = shapeProp ?? inherited;
  const chosen = value.map((v) => options.find((o) => o.value === v)).filter((o): o is SelectOption<V> => !!o);
  return (
    <ReactSelect<SelectOption<V>, true>
      unstyled
      isMulti
      isSearchable
      closeMenuOnSelect={false}
      hideSelectedOptions
      isDisabled={disabled}
      isLoading={loading}
      aria-label={ariaLabel}
      inputId={inputId}
      placeholder={placeholder}
      options={options}
      value={chosen}
      onChange={(next) => onChange(next.map((o) => o.value))}
      noOptionsMessage={() => noOptionsText ?? '–'}
      menuPlacement="auto"
      menuPortalTarget={portalTarget ?? (typeof document === 'undefined' ? undefined : document.body)}
      menuPosition="fixed"
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
      classNames={{
        container: () => `${className ?? ''} min-w-[6rem]`,
        control: ({ isFocused, isDisabled }) =>
          `flex min-h-[2.75rem] cursor-pointer items-center border bg-card text-sm ${shape === 'field' ? 'rounded-xl px-3 py-2' : 'rounded-2xl px-3 py-1.5'} ${isFocused ? 'border-ring ring-1 ring-ring' : 'border-input'} ${isDisabled ? 'opacity-60' : ''}`,
        valueContainer: () => 'flex flex-wrap gap-1.5',
        multiValue: () => 'flex items-center gap-1 rounded-full border border-border bg-muted/60 py-0.5 pr-1 pl-2.5 text-xs',
        multiValueLabel: () => 'truncate',
        multiValueRemove: () => 'grid size-4 place-items-center rounded-full hover:bg-accent',
        placeholder: () => 'px-1 text-muted-foreground',
        input: () => 'text-foreground',
        indicatorsContainer: () => 'pl-1 text-muted-foreground',
        indicatorSeparator: () => 'hidden',
        clearIndicator: () => 'px-1 hover:text-foreground',
        dropdownIndicator: () => 'px-1',
        menu: () => 'z-50 mt-1 overflow-hidden rounded-2xl border border-border bg-card p-1 text-sm',
        menuList: () => 'max-h-60 overflow-y-auto',
        option: ({ isFocused }) => `cursor-pointer rounded-xl px-3 py-1.5 ${isFocused ? 'bg-accent/60' : ''}`,
        noOptionsMessage: () => 'px-3 py-2 text-muted-foreground',
      }}
    />
  );
}
