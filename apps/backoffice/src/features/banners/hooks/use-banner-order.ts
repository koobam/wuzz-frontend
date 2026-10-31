import { useState } from 'react';
import { useOrderedBanners, useReorderBanners } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';

/**
 * The order page: every banner in the carousel's order, rearranged on the page and saved in one go (after a confirmation).
 * Until something is moved the order is the server's, so what the page shows is always either what is stored or what is waiting to be saved.
 */
export function useBannerOrder() {
  const list = useOrderedBanners();
  const ask = useConfirmAction();
  const [moved, setMoved] = useState<number[] | null>(null);
  const save = useReorderBanners({ onSaved: () => setMoved(null) });

  const stored = list.data ?? [];
  const byId = new Map(stored.map((b) => [b.id, b]));
  // A banner added or deleted elsewhere since the page was arranged: keep the arrangement for those that are still there, and append the new ones.
  const ids = moved ? [...moved.filter((id) => byId.has(id)), ...stored.map((b) => b.id).filter((id) => !moved.includes(id))] : stored.map((b) => b.id);
  const dirty = ids.some((id, i) => id !== stored[i]?.id);

  return {
    banners: ids.map((id) => byId.get(id)!),
    ready: !!list.data,
    error: list.error ?? save.error,
    dirty,
    saving: save.isPending,
    move: (next: number[]) => setMoved(next),
    reset: () => setMoved(null),
    save: async () => {
      if (!dirty || !(await ask.reorder(ids.length))) return;
      save.mutate(ids);
    },
  };
}
