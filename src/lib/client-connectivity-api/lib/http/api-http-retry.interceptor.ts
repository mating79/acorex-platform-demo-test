//#region ----- Imports -----

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { apiHttpRetryDelayMs, isRetriableHttpError } from './api-http-retry.util';

//#endregion

//#region ----- Interceptor -----

/**
 * Retries transient connectivity failures (status 0, 502, 503, 504) for idempotent
 * platform API calls: GET/HEAD and read-only POST runtime queries.
 */
@Injectable()
export class AXCApiHttpRetryInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.sendWithRetry(request, next, 0);
  }

  private sendWithRetry(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    attempt: number,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!isRetriableHttpError(error, request, attempt)) {
          return throwError(() => error);
        }

        const nextAttempt = attempt + 1;
        return timer(apiHttpRetryDelayMs(nextAttempt)).pipe(
          switchMap(() => this.sendWithRetry(request, next, nextAttempt)),
        );
      }),
    );
  }
}

//#endregion
