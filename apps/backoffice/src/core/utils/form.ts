import type { FieldErrors, FieldValues } from 'react-hook-form';

/** The first message of a form's errors, whichever field (or row of a list) it belongs to; undefined when the form is valid. */
export function firstError<T extends FieldValues>(errors: FieldErrors<T>): string | undefined {
  const walk = (node: unknown): string | undefined => {
    if (!node || typeof node !== 'object') return undefined;
    const { message, ref: _ref, type: _type, ...rest } = node as { message?: unknown; ref?: unknown; type?: unknown; [k: string]: unknown };
    if (typeof message === 'string' && message) return message;
    for (const child of Object.values(rest)) {
      const found = walk(child);
      if (found) return found;
    }
    return undefined;
  };
  return walk(errors);
}
