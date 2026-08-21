import { isAuthHttpRequest } from '@acorex-platform/client-connectivity-api';
import { AXPSessionService } from '@acorex-platform/framework-client/auth';
import { AXPRealtimeConnectionService } from '@acorex-platform/framework-client/realtime';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, switchMap, tap } from 'rxjs/operators';

//#region ----- Cookie session interceptor -----

/**
 * Attaches credentials for HttpOnly cookie auth and refreshes on 401.
 * Access tokens are never read from JavaScript.
 */
@Injectable()
export class BasicInterceptor implements HttpInterceptor {
  private readonly session = inject(AXPSessionService);
  private readonly router = inject(Router);
  private readonly realtime = inject(AXPRealtimeConnectionService, { optional: true });

  /** Single in-flight refresh shared by every request that hits a 401 while it runs. */
  private refresh$: Observable<boolean> | null = null;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let modifiedReq = request.clone({ withCredentials: true });
    if (!(request.body instanceof FormData) && !request.headers.has('Content-Type')) {
      modifiedReq = modifiedReq.clone({ setHeaders: { 'Content-Type': 'application/json' } });
    }

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 &&
          this.session.hasSessionCredentials() &&
          !isAuthHttpRequest(request)
        ) {
          return this.handle401Error(modifiedReq, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.refresh$ ??= from(this.session.refreshToken()).pipe(
      catchError((error) => {
        void this.session.signout();
        void this.router.navigate(['auth']);
        return throwError(() => error);
      }),
      finalize(() => {
        this.refresh$ = null;
      }),
      shareReplay(1),
    );

    return this.refresh$.pipe(
      tap(() => this.realtime?.reconnectWithCurrentToken()),
      switchMap(() => next.handle(request.clone({ withCredentials: true }))),
    );
  }
}

//#endregion
