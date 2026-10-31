import { i18n } from '@/core/utils/i18n';
import { env } from '@/config/env';
import { ApiError } from './error';
import { accessToken, refreshSession } from './request';
import type { Envelope } from './response';
import { AUDIENCE } from './session';

export type UploadOptions = {
  /** Extra form fields sent beside the file, e.g. `{ folder: 'outlets' }`. */
  fields?: Record<string, string>;
  /** Called with 0..1 while the file goes up. */
  onProgress?: (fraction: number) => void;
  /** Aborts the request (the promise then rejects with an `AbortError`). */
  signal?: AbortSignal;
};

/** One multipart POST with progress (fetch cannot report upload progress, so this is an XMLHttpRequest). */
function send<T>(path: string, file: File, token: string | null, { fields, onProgress, signal }: UploadOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    for (const [k, v] of Object.entries(fields ?? {})) form.append(k, v);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${env.VITE_API_URL}/${AUDIENCE}/v1${path}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onerror = () => reject(new ApiError(0, i18n.t('common.requestFailed', { status: 0 })));
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
    xhr.onload = () => {
      let body: Envelope<T> | null = null;
      try {
        body = JSON.parse(xhr.responseText) as Envelope<T>;
      } catch {
        // a non-JSON answer from a proxy
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.success) resolve(body.data);
      else reject(new ApiError(xhr.status, body?.message ?? i18n.t('common.requestFailed', { status: xhr.status })));
    };
    signal?.addEventListener('abort', () => xhr.abort(), { once: true });
    if (signal?.aborted) return reject(new DOMException('Upload cancelled', 'AbortError'));
    xhr.send(form);
  });
}

/** Uploads a file as multipart field `file` with the staff session's token; one refresh and retry when the token is refused. */
export async function upload<T>(path: string, file: File, options: UploadOptions = {}): Promise<T> {
  const token = await accessToken();
  try {
    return await send<T>(path, file, token, options);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && token) {
      const next = await refreshSession();
      if (next) return send<T>(path, file, next.access_token, options);
    }
    throw e;
  }
}
