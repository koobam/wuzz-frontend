import type { ReactNode } from 'react';
import { Input, type InputProps } from '../../atoms/input';
import { Field } from '../field';

/** A label, a text box and the message about it: what a form is made of. It fills the width of its cell; `error` is the message of the field, if it has one. */
export function TextField({
  label,
  hint,
  error,
  required,
  fieldClassName,
  children,
  ...input
}: { label: ReactNode; hint?: ReactNode; error?: string; fieldClassName?: string; children?: ReactNode } & InputProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      {(id) => (
        <>
          <Input id={id} invalid={!!error} required={false} aria-required={required || undefined} {...input} />
          {children}
        </>
      )}
    </Field>
  );
}
