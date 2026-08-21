import { AXP_ROOT_CONFIG_TOKEN } from '@acorex-platform/framework-client/common';
import {
  buildRuntimeInvokeQueryString,
  type AXPCommandExecuteOptions,
  type AXPQueryExecuteOptions,
} from '@acorex-platform/framework-shared/runtime';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { skipAuthRetryHeadersForRuntime } from '../http/api-http-auth.util';
import { mapHttpErrorResponseToAXPRequestError } from '../http/map-http-error-to-request-error.util';
import { AXCRuntimeQueryCacheService } from './runtime-query-cache.service';
import type {
  AXCRuntimeBulkCommandRequest,
  AXCRuntimeBulkCommandResult,
  AXCRuntimeCommandResult,
  AXCRuntimeQueryResult,
} from './runtime-api.types';

//#region ---- Runtime API service ----

/**
 * HTTP client for platform runtime command/query endpoints.
 * Transport failures are normalized to {@link AXPRequestError}.
 */
@Injectable()
export class AXCRuntimeApiService {
  private readonly http = inject(HttpClient);
  private readonly configs = inject(AXP_ROOT_CONFIG_TOKEN);
  private readonly queryCache = inject(AXCRuntimeQueryCacheService);

  private runtimeUrl(kind: 'commands' | 'commands/bulk' | 'queries'): string {
    return `${this.configs.baseUrl}/v1/runtime/${kind}`;
  }

  /**
   * Single command/query invoke — key (and entity for `Entity:*:Default`) in the
   * query string so DevTools shows the operation without `%3A` noise.
   */
  private runtimeInvokeUrl(kind: 'commands' | 'queries', name: string, input?: unknown): string {
    const query = buildRuntimeInvokeQueryString(name, input);
    return `${this.configs.baseUrl}/v1/runtime/${kind}/invoke?${query}`;
  }

  executeCommand(
    name: string,
    input?: unknown,
    options?: AXPCommandExecuteOptions,
  ): Promise<AXCRuntimeCommandResult> {
    const skipAuthRetry = skipAuthRetryHeadersForRuntime(name, 'command');
    const headers = skipAuthRetry ? new HttpHeaders(skipAuthRetry) : undefined;
    const hasOptions = options != null && Object.keys(options).length > 0;

    const request$ = hasOptions
      ? this.http.post<AXCRuntimeCommandResult>(
          this.runtimeUrl('commands'),
          { name, input: input ?? {}, options },
          { withCredentials: true, ...(headers ? { headers } : undefined) },
        )
      : this.http.post<AXCRuntimeCommandResult>(
          this.runtimeInvokeUrl('commands', name, input),
          input ?? {},
          { withCredentials: true, ...(headers ? { headers } : undefined) },
        );

    return firstValueFrom(
      request$.pipe(catchError((error) => throwError(() => mapHttpErrorResponseToAXPRequestError(error)))),
    ).then((result) => {
      if (result.success) {
        this.queryCache.clear();
      }
      return result;
    });
  }

  executeBulkCommand(request: AXCRuntimeBulkCommandRequest): Promise<AXCRuntimeBulkCommandResult> {
    return firstValueFrom(
      this.http
        .post<AXCRuntimeBulkCommandResult>(this.runtimeUrl('commands/bulk'), request, {
          withCredentials: true,
        })
        .pipe(catchError((error) => throwError(() => mapHttpErrorResponseToAXPRequestError(error)))),
    ).then((result) => {
      if (result.success) {
        this.queryCache.clear();
      }
      return result;
    });
  }

  executeQuery(
    name: string,
    input?: unknown,
    options?: AXPQueryExecuteOptions,
  ): Promise<AXCRuntimeQueryResult> {
    return this.queryCache.execute(name, input, () => this.sendQuery(name, input, options), options);
  }

  private sendQuery(
    name: string,
    input?: unknown,
    options?: AXPQueryExecuteOptions,
  ): Promise<AXCRuntimeQueryResult> {
    const skipAuthRetry = skipAuthRetryHeadersForRuntime(name, 'query');
    const headers = skipAuthRetry ? new HttpHeaders(skipAuthRetry) : undefined;
    const hasOptions = options != null && Object.keys(options).length > 0;

    // Named body carries `options`; invoke keeps body = input only for DevTools-friendly URLs.
    const request$ = hasOptions
      ? this.http.post<AXCRuntimeQueryResult>(
          this.runtimeUrl('queries'),
          { name, input: input ?? {}, options },
          { withCredentials: true, ...(headers ? { headers } : undefined) },
        )
      : this.http.post<AXCRuntimeQueryResult>(
          this.runtimeInvokeUrl('queries', name, input),
          input ?? {},
          { withCredentials: true, ...(headers ? { headers } : undefined) },
        );

    return firstValueFrom(
      request$.pipe(catchError((error) => throwError(() => mapHttpErrorResponseToAXPRequestError(error)))),
    );
  }
}

//#endregion
