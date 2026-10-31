import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadImage, type UploadFolder } from '@/core/api';
import { ApiError } from '@/core/http';
import { useTranslation } from '@/core/utils/i18n';
import { imageFileSchema } from '@/features/outlets/utils/image-file.schema';

/** The file on its way up (or that failed): shown over the picture area with its progress, or its message and a retry. */
export type BannerUpload = { name: string; preview: string; progress: number; error?: string };

/**
 * The banner picture uploader: it checks the picked file (type, size), sends it to the server with progress and, once stored,
 * hands its address to `onChange`. One picture at a time; picking another while one is going up replaces it. A refused or
 * failed file stays in `pending` with its message, to retry or dismiss.
 */
export function useBannerImageUpload(onChange: (url: string) => void, folder: UploadFolder = 'banners') {
  const { t } = useTranslation();
  const [pending, setPending] = useState<BannerUpload | null>(null);
  const [notice, setNotice] = useState<string | undefined>();
  const file = useRef<File | null>(null);
  const controller = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    setPending((p) => {
      if (p) URL.revokeObjectURL(p.preview);
      return null;
    });
    file.current = null;
    controller.current = null;
  }, []);

  const run = useCallback(async () => {
    const f = file.current;
    if (!f) return;
    controller.current?.abort();
    const mine = new AbortController();
    controller.current = mine;
    setPending((p) => (p ? { ...p, progress: 0, error: undefined } : p));
    try {
      const saved = await uploadImage(f, folder, { signal: mine.signal, onProgress: (fraction) => setPending((p) => (p ? { ...p, progress: fraction } : p)) });
      if (mine.signal.aborted) return;
      onChange(saved.url);
      clear();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setPending((p) => (p ? { ...p, error: e instanceof ApiError ? e.message : t('banners.form.uploadFailed') } : p));
    }
  }, [clear, folder, onChange, t]);

  const pick = useCallback(
    (picked: File | undefined) => {
      if (!picked) return;
      const checked = imageFileSchema(t).safeParse(picked);
      if (!checked.success) {
        setNotice(`${picked.name}: ${checked.error.issues[0]?.message}`);
        return;
      }
      setNotice(undefined);
      controller.current?.abort();
      setPending((p) => {
        if (p) URL.revokeObjectURL(p.preview);
        return { name: picked.name, preview: URL.createObjectURL(picked), progress: 0 };
      });
      file.current = picked;
      void run();
    },
    [run, t],
  );

  const cancel = useCallback(() => {
    controller.current?.abort();
    clear();
  }, [clear]);

  // Leaving the page cancels what is still going up.
  useEffect(() => () => controller.current?.abort(), []);

  return { pending, notice, pick, retry: run, cancel, uploading: !!pending && !pending.error };
}
