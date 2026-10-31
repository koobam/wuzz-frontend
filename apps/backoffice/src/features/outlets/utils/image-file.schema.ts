import { z } from 'zod';
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/core/api';

type T = (key: string, options?: Record<string, unknown>) => string;

/** What a picked file must be before it is sent: a picture of an allowed type, no bigger than 5 MB. */
export const imageFileSchema = (t: T) =>
  z
    .instanceof(File)
    .refine((f) => (IMAGE_TYPES as readonly string[]).includes(f.type), { error: t('outlets.form.fileType') })
    .refine((f) => f.size <= MAX_IMAGE_BYTES, { error: t('outlets.form.fileSize', { mb: MAX_IMAGE_BYTES / 1024 / 1024 }) })
    .refine((f) => f.size > 0, { error: t('outlets.form.fileEmpty') });
