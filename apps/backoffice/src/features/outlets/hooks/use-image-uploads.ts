import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadImage } from '@/core/api';
import { ApiError } from '@/core/http';
import { useTranslation } from '@/core/utils/i18n';
import { imageFileSchema } from '../utils/image-file.schema';
import { MAX_OUTLET_IMAGES } from '../utils/outlet-form.schema';

/** A file on its way up (or that failed): shown above the list of photos that are already stored. */
export type PendingUpload = { id: number; name: string; preview: string; progress: number; error?: string };

/**
 * The outlet photos uploader: it checks each picked file (type, size, how many photos there may be), sends the good ones one by
 * one to the server with progress, and, as each lands, adds its address to the photo list through `onChange`. A failed or
 * refused file stays in `pending` with its message, to retry or dismiss.
 */
export function useImageUploads(value: string[], onChange: (images: string[]) => void) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [notice, setNotice] = useState<string | undefined>();
  const files = useRef(new Map<number, File>());
  const controllers = useRef(new Map<number, AbortController>());
  const next = useRef(1);
  // The list as it is NOW: uploads finish at different times, each must add to the latest list.
  const latest = useRef(value);
  latest.current = value;
  const count = useRef(0);
  count.current = value.length + pending.filter((p) => !p.error).length;

  const patch = useCallback((id: number, change: Partial<PendingUpload>) => setPending((all) => all.map((p) => (p.id === id ? { ...p, ...change } : p))), []);
  const drop = useCallback((id: number) => {
    setPending((all) => {
      const gone = all.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return all.filter((p) => p.id !== id);
    });
    files.current.delete(id);
    controllers.current.delete(id);
  }, []);

  const run = useCallback(
    async (id: number) => {
      const file = files.current.get(id);
      if (!file) return;
      const controller = new AbortController();
      controllers.current.set(id, controller);
      patch(id, { progress: 0, error: undefined });
      try {
        const saved = await uploadImage(file, 'outlets', { signal: controller.signal, onProgress: (f) => patch(id, { progress: f }) });
        // Several uploads can land before the next render: build on the list they have just made, not on the stale prop.
        latest.current = [...latest.current.filter((x) => x !== saved.url), saved.url];
        onChange(latest.current);
        drop(id);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return drop(id);
        patch(id, { error: e instanceof ApiError ? e.message : t('outlets.form.uploadFailed') });
      }
    },
    [drop, onChange, patch, t],
  );

  const add = useCallback(
    (picked: File[]) => {
      const schema = imageFileSchema(t);
      const problems: string[] = [];
      let room = MAX_OUTLET_IMAGES - count.current;
      for (const file of picked) {
        const checked = schema.safeParse(file);
        if (!checked.success) {
          problems.push(`${file.name}: ${checked.error.issues[0]?.message}`);
          continue;
        }
        if (room <= 0) {
          problems.push(`${file.name}: ${t('outlets.form.imagesMax')}`);
          continue;
        }
        room -= 1;
        const id = next.current++;
        files.current.set(id, file);
        setPending((all) => [...all, { id, name: file.name, preview: URL.createObjectURL(file), progress: 0 }]);
        void run(id);
      }
      setNotice(problems.length ? problems.join('\n') : undefined);
    },
    [run, t],
  );

  const cancel = useCallback((id: number) => {
    controllers.current.get(id)?.abort();
    drop(id);
  }, [drop]);

  // Leaving the page cancels what is still going up and frees the previews.
  useEffect(() => {
    const live = controllers.current;
    return () => live.forEach((c) => c.abort());
  }, []);

  return { pending, notice, add, retry: run, cancel, uploading: pending.some((p) => !p.error), full: value.length + pending.length >= MAX_OUTLET_IMAGES };
}
