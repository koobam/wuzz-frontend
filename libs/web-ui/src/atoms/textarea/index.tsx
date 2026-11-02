import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';
import { inputVariants } from '../input';

/** A multi-line text box, drawn like `Input`; it takes every attribute of a `<textarea>` and a `ref` (react-hook-form's `register`). */
export function Textarea({ invalid = false, className, rows = 3, ...props }: ComponentProps<'textarea'> & { invalid?: boolean }) {
  return <textarea rows={rows} aria-invalid={invalid || undefined} className={cn(inputVariants({ shape: 'field', invalid }), 'resize-y', className)} {...props} />;
}
