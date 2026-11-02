import { fetch as nitroFetch } from 'react-native-nitro-fetch';
import { Platform } from 'react-native';
import {
  getBrand,
  getDeviceName,
  getModel,
  getUniqueId,
  getUserAgent,
} from 'react-native-device-info';
import { NetworkInfo } from 'react-native-network-info';
import { ACCESS_TOKEN_STORAGE, REFRESH_TOKEN_STORAGE, storage } from '@wuzz/native/storage';
import apiUrl, { API_V1 } from './url';

type RequestOptions = {
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  prefetchKey?: string;
  signal?: AbortSignal;
};

type TokenData = {
  accessToken: string;
  refreshToken: string;
};

// How long a prefetched response is considered fresh once a real request
// asks for it by prefetchKey. Nitro Fetch's own default is 5s, which is too
// short for app-start prefetches (fired natively before JS even loads).
const PREFETCH_CACHE_TTL_MS = 60_000;

let isRefreshing = false;
let refreshTokenPromise: Promise<TokenData> | null = null;

// Cached once on first request — getUserAgent() spins a WKWebView on iOS
let cachedDeviceHeaders: Record<string, string> | null = null;

const NS_URL_ERROR_MESSAGES: Record<number, string> = {
  [-324]: 'Network request failed. Please try again.',
  [-1001]: 'Request timed out. Please try again.',
  [-1003]: 'Server not found. Check your connection.',
  [-1004]: 'Could not connect to the server.',
  [-1005]: 'Network connection was lost.',
  [-1009]: 'No internet connection.',
  [-1011]: 'Server returned an invalid response.',
  [-1012]: 'SSL handshake failed.',
  [-1200]: 'Secure connection failed.',
};

function parseNetworkError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  const codeMatch = message.match(/Code=(-?\d+)/);
  if (codeMatch) {
    const code = parseInt(codeMatch[1], 10);
    const readable = NS_URL_ERROR_MESSAGES[code];
    if (readable) return Object.assign(new Error(readable), { code });
  }
  // Android: java.net.ConnectException etc.
  if (message.includes('ECONNREFUSED') || message.includes('ConnectException')) {
    return new Error('Could not connect to the server.');
  }
  if (message.includes('ETIMEDOUT') || message.includes('SocketTimeoutException')) {
    return new Error('Request timed out. Please try again.');
  }
  if (message.includes('ENOTFOUND') || message.includes('UnknownHostException')) {
    return new Error('Server not found. Check your connection.');
  }

  if (message.includes('ERR_EMPTY_RESPONSE')) {
    return new Error('Server returned an empty response.');
  }

  // Android: Cronet (net::ERR_*) errors
  if (message.includes('net::ERR_CONNECTION_REFUSED')) {
    return new Error('Could not connect to the server.');
  }
  if (message.includes('net::ERR_CONNECTION_TIMED_OUT') || message.includes('net::ERR_TIMED_OUT')) {
    return new Error('Request timed out. Please try again.');
  }
  if (message.includes('net::ERR_NAME_NOT_RESOLVED') || message.includes('net::ERR_INTERNET_DISCONNECTED')) {
    return new Error('Server not found. Check your connection.');
  }
  if (message.includes('net::ERR_CONNECTION_RESET') || message.includes('net::ERR_NETWORK_CHANGED')) {
    return new Error('Network connection was lost.');
  }
  if (message.includes('net::ERR_SSL') || message.includes('net::ERR_CERT')) {
    return new Error('Secure connection failed.');
  }
  return err instanceof Error ? err : new Error(message);
}

async function getDeviceHeaders(): Promise<Record<string, string>> {
  if (cachedDeviceHeaders) return cachedDeviceHeaders;

  const [deviceID, ipAddress, deviceName, userAgent] = await Promise.all([
    getUniqueId().catch(() => null),
    NetworkInfo.getIPAddress().catch(() => null),
    getDeviceName().catch(() => null),
    getUserAgent().catch(() => null),
  ]);

  if (!deviceID || !ipAddress) return {};

  cachedDeviceHeaders = {
    DeviceID: deviceID,
    DeviceBrand: getBrand(),
    DeviceName: deviceName ?? '',
    DeviceModel: getModel(),
    Platform: Platform.OS,
    IPAddress: ipAddress,
    ...(userAgent ? { 'User-Agent': userAgent } : {}),
  };

  return cachedDeviceHeaders;
}

export async function buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const authToken = storage.getString(ACCESS_TOKEN_STORAGE);
  const deviceHeaders = await getDeviceHeaders();

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...deviceHeaders,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...extra,
  };
}

async function doRefreshTokens(): Promise<TokenData> {
  const headers = await buildHeaders();
  const response = await nitroFetch(apiUrl(`${API_V1}/refresh`), {
    method: 'POST',
    headers,
    body: JSON.stringify({ refreshToken: storage.getString(REFRESH_TOKEN_STORAGE) }),
  });
  const json = await response.json() as { data: TokenData };
  const tokenData = json.data;
  if (!tokenData) throw new Error('Failed to refresh token: No data received');
  storage.set(ACCESS_TOKEN_STORAGE, tokenData.accessToken);
  storage.set(REFRESH_TOKEN_STORAGE, tokenData.refreshToken);
  return tokenData;
}

async function executeRequest(
  url: string,
  options: RequestOptions,
  retried = false,
): Promise<unknown> {
  const { method = 'GET', data, headers: extraHeaders, prefetchKey, signal } = options;
  const headers = await buildHeaders({
    ...extraHeaders,
    ...(prefetchKey ? { prefetchKey } : undefined),
  });

  let response: Awaited<ReturnType<typeof nitroFetch>>;
  try {
    response = await nitroFetch(url, {
      method,
      headers,
      body: data != null ? JSON.stringify(data) : undefined,
      signal,
      // Default prefetch cache TTL is 5s, too short for an app-start prefetch
      // (fired natively before the JS bundle even loads) to still be fresh by
      // the time the real query runs after JS init + first render.
      ...(prefetchKey ? { prefetchCacheTtlMs: PREFETCH_CACHE_TTL_MS } : undefined),
    });
  } catch (err) {
    throw parseNetworkError(err);
  }

  if (response.status === 401 && !retried && !url.includes('/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenPromise = doRefreshTokens().finally(() => {
        isRefreshing = false;
        refreshTokenPromise = null;
      });
    }

    const tokenData = await refreshTokenPromise!;
    return executeRequest(
      url,
      {
        ...options,
        headers: { ...extraHeaders, Authorization: `Bearer ${tokenData.accessToken}` },
      },
      true,
    );
  }

  const json = await response.json();

  if (!response.ok) {
    return Promise.reject(json);
  }

  return json;
}

const request = <T = unknown>(url?: string, options?: RequestOptions): Promise<T> => {
  if (!url) return Promise.reject(new Error('URL is required'));
  return executeRequest(url, options ?? {}) as Promise<T>;
};

export default request;
