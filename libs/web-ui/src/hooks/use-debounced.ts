import { useEffect, useState } from 'react';

/** A value that follows `value` once it has stood still for `ms`: a search runs when typing pauses, not on every key. */
export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
