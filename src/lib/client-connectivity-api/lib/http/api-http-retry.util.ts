import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { isAuthHttpRequest } from './api-http-auth.util';

//#region ----- Constants -----

export { API_SKIP_AUTH_RETRY_HEADER, isAuthHttpRequest } from './api-http-auth.util';

export const API_HTTP_RETRY_MAX_ATTEMPTS = 5;
export const API_HTTP_RETRY_BASE_MS = 400;

/** POST endpoints that only perform reads and are safe to retry after transient failures. */
const READ_ONLY_POST_URL_PARTS = ['/v1/runtime/queries'];

//#endregion

//#region ----- Retry helpers -----

export function apiHttpRetryDelayMs(attempt: number): number {
  return API_HTTP_RETRY_BASE_MS * attempt;
}

/** GET/HEAD and read-only POST queries — safe to retry when the server may not have responded. */
export function isSafeToRetryHttpRequest(request: HttpRequest<unknown>): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true;
  }

  return (
    request.method === 'POST' &&
    READ_ONLY_POST_URL_PARTS.some((part) => request.url.includes(part))
  );
}

export function isRetriableHttpError(
  error: HttpErrorResponse,
  request: HttpRequest<unknown>,
  attempt: number,
): boolean {
  if (attempt >= API_HTTP_RETRY_MAX_ATTEMPTS) {
    return false;
  }

  if (isAuthHttpRequest(request)) {
    return false;
  }

  if (request.headers.has('X-Skip-Http-Retry')) {
    return false;
  }

  const status = error.status;
  const isTransientStatus = status === 0 || status === 502 || status === 503 || status === 504;

  if (!isTransientStatus) {
    return false;
  }

  return isSafeToRetryHttpRequest(request);
}

//#endregion
