import {
  AUTH_LIST_PROVIDERS_DEFAULT,
  AUTH_LOGOUT_DEFAULT,
  AUTH_REFRESH_DEFAULT,
  AUTH_REGISTER_DEFAULT,
  AUTH_SIGN_IN_DEFAULT,
  AUTH_UPDATE_SESSION_DEFAULT,
} from '@acorex-platform/framework-shared/runtime';
import type { HttpRequest } from '@angular/common/http';

//#region ----- Constants -----

/** Client-only marker: do not refresh/retry auth HTTP when this request fails. */
export const API_SKIP_AUTH_RETRY_HEADER = 'X-Skip-Auth-Retry';

const AUTH_RUNTIME_COMMAND_KEYS = new Set<string>([
  AUTH_SIGN_IN_DEFAULT,
  AUTH_REGISTER_DEFAULT,
  AUTH_REFRESH_DEFAULT,
  AUTH_LOGOUT_DEFAULT,
  AUTH_UPDATE_SESSION_DEFAULT,
]);

const AUTH_RUNTIME_QUERY_KEYS = new Set<string>([AUTH_LIST_PROVIDERS_DEFAULT]);

//#endregion

//#region ----- Auth HTTP helpers -----

export function isAuthRuntimeCommandKey(name: string): boolean {
  return AUTH_RUNTIME_COMMAND_KEYS.has(name);
}

export function isAuthRuntimeQueryKey(name: string): boolean {
  return AUTH_RUNTIME_QUERY_KEYS.has(name);
}

/** Headers for auth runtime transport calls (prevents 401 refresh loops). */
export function skipAuthRetryHeadersForRuntime(
  name: string,
  kind: 'command' | 'query',
): Record<string, string> | undefined {
  const isAuth =
    kind === 'command' ? isAuthRuntimeCommandKey(name) : isAuthRuntimeQueryKey(name);

  return isAuth ? { [API_SKIP_AUTH_RETRY_HEADER]: '1' } : undefined;
}

/**
 * True when the request is part of the auth flow and must not trigger token refresh
 * or transient HTTP retry (legacy `/v1/auth/*`, runtime auth keys, or explicit header).
 */
export function isAuthHttpRequest(request: HttpRequest<unknown>): boolean {
  if (request.headers.has(API_SKIP_AUTH_RETRY_HEADER)) {
    return true;
  }

  if (request.url.includes('/v1/auth/')) {
    return true;
  }

  return isAuthRuntimeHttpRequest(request);
}

function isAuthRuntimeHttpRequest(request: HttpRequest<unknown>): boolean {
  if (request.method !== 'POST') {
    return false;
  }

  const runtimeKey = resolveRuntimeRequestName(request);
  if (!runtimeKey) {
    return false;
  }

  if (request.url.includes('/v1/runtime/commands')) {
    return isAuthRuntimeCommandKey(runtimeKey);
  }

  if (request.url.includes('/v1/runtime/queries')) {
    return isAuthRuntimeQueryKey(runtimeKey);
  }

  return false;
}

/**
 * Prefer `?name=` (invoke) over envelope `body.name` so input-only bodies that
 * happen to include a `name` field cannot be mistaken for the runtime key.
 */
function resolveRuntimeRequestName(request: HttpRequest<unknown>): string | undefined {
  const fromUrl = readRuntimeNameFromUrl(request.url);
  if (fromUrl) {
    return fromUrl;
  }

  return readRuntimeRequestNameFromBody(request.body);
}

function readRuntimeNameFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url, 'http://localhost');
    const name = parsed.searchParams.get('name');
    return typeof name === 'string' && name.trim() ? name.trim() : undefined;
  } catch {
    return undefined;
  }
}

function readRuntimeRequestNameFromBody(body: unknown): string | undefined {
  if (body == null || typeof body !== 'object') {
    return undefined;
  }

  const name = (body as { name?: unknown }).name;
  return typeof name === 'string' && name.trim() ? name.trim() : undefined;
}

//#endregion
