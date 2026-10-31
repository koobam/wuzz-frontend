import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';

/** The look of a text box: `field` is a form's, `pill` the one in a toolbar. */
export const inputVariants = cva('w-full border bg-card text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-60', {
  variants: {
    shape: {
      field: 'rounded-xl px-4 py-3',
      pill: 'rounded-full px-4 py-2',
    },
    invalid: { true: 'border-destructive', false: 'border-input' },
  },
  defaultVariants: { shape: 'field', invalid: false },
});

export type InputProps = Omit<ComponentProps<'input'>, 'size'> & Pick<VariantProps<typeof inputVariants>, 'shape'> & { invalid?: boolean };

/** A text box. It takes every attribute of an `<input>`, and a `ref`, so it works with react-hook-form's `register`. */
export function Input({ shape, invalid = false, className, ...props }: InputProps) {
  return <input aria-invalid={invalid || undefined} className={cn(inputVariants({ shape, invalid }), className)} {...props} />;
}
