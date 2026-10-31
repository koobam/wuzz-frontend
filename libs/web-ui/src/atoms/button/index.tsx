import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';

/**
 * The look of every button. `primary` is the one solid action of a screen, `outline` the others, `link` a small action
 * inside a form ("use a different number"). Pages that need the look on something else (a link) take `buttonVariants`.
 */
export const buttonVariants = cva('disabled:cursor-not-allowed disabled:opacity-50', {
  variants: {
    variant: {
      primary: 'rounded-full bg-ink font-medium text-background',
      outline: 'rounded-full border border-input bg-card hover:bg-accent',
      link: 'text-muted-foreground underline hover:text-foreground',
    },
    size: {
      sm: 'px-3 py-1 text-xs',
      md: 'px-5 py-2 text-sm',
      lg: 'px-4 py-3 text-sm',
    },
    block: { true: 'w-full', false: '' },
  },
  compoundVariants: [
    { variant: 'outline', size: 'md', class: 'px-4' },
    { variant: 'link', class: 'p-0 text-xs' },
  ],
  defaultVariants: { variant: 'outline', size: 'md', block: false },
});

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

/** A button. It is a `type="button"` unless said otherwise, so one in a form never submits it by accident. */
export function Button({ variant, size, block, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
