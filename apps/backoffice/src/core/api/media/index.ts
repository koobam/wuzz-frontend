import { upload, type UploadOptions } from '@/core/http';
import type { UploadedImage, UploadFolder } from './media.types';

/** What a picture may be, and how big: the server enforces the same limits. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Uploads one picture to `folder` and returns where it is now (an https address). */
export const uploadImage = (file: File, folder: UploadFolder, options: Omit<UploadOptions, 'fields'> = {}) =>
  upload<UploadedImage>('/uploads', file, { ...options, fields: { folder } });
