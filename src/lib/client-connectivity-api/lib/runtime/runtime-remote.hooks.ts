import {
  AXP_DISTRIBUTED_EVENT_LISTENER_PROVIDER,
  type AXPDistributedEventListenerProvider,
} from '@acorex-platform/framework-client/core';
import {
  AXPRuntimeRemoteHookKeys,
  type AXPRuntimeCommandExecuteBulkHookPayload,
  type AXPRuntimeCommandExecuteHookPayload,
  type AXPRuntimeQueryExecuteHookPayload,
} from '@acorex-platform/framework-client/runtime';
import { AXPRequestError } from '@acorex-platform/framework-shared/core';
import { inject, type Provider } from '@angular/core';
import { AXCRuntimeApiService } from './runtime-api.service';
import { AXCRuntimeQueryCacheService } from './runtime-query-cache.service';
import type { AXCRuntimeQueryResult } from './runtime-api.types';

//#region ---- Unwrap helpers ----

/**
 * Map server runtime query envelope to the value local {@code query.fetch} would return.
 *
 * - success: false → throw using `message`
 * - kind: 'value' | 'object' | 'collection' → `data`
 */
export function unwrapRuntimeQueryResult(result: AXCRuntimeQueryResult): unknown {
  if (!result.success) {
    const message = result.message;
    const text =
      typeof message?.text === 'string'
        ? message.text
        : message?.code || 'Query execution failed';
    throw new AXPRequestError(text, {
      code: message?.code,
      details: message?.details,
    });
  }

  if (result.kind === 'collection' || result.kind === 'object' || result.kind === 'value') {
    return result.data;
  }

  return result;
}

//#endregion

//#region ---- Hook providers ----

export const AXCRuntimeCommandExecuteHookProvider: AXPDistributedEventListenerProvider<
  AXPRuntimeCommandExecuteHookPayload,
  AXPRuntimeCommandExecuteHookPayload
> = {
  key: AXPRuntimeRemoteHookKeys.CommandExecute,
  async execute(payload) {
    if (payload.handled) {
      return payload;
    }
    const api = inject(AXCRuntimeApiService);
    const result = await api.executeCommand(payload.name, payload.input, payload.options);
    return { ...payload, handled: true, result };
  },
};

export const AXCRuntimeCommandExecuteBulkHookProvider: AXPDistributedEventListenerProvider<
  AXPRuntimeCommandExecuteBulkHookPayload,
  AXPRuntimeCommandExecuteBulkHookPayload
> = {
  key: AXPRuntimeRemoteHookKeys.CommandExecuteBulk,
  async execute(payload) {
    if (payload.handled) {
      return payload;
    }
    const api = inject(AXCRuntimeApiService);
    const result = await api.executeBulkCommand(payload.request);
    return { ...payload, handled: true, result };
  },
};

export const AXCRuntimeQueryExecuteHookProvider: AXPDistributedEventListenerProvider<
  AXPRuntimeQueryExecuteHookPayload,
  AXPRuntimeQueryExecuteHookPayload
> = {
  key: AXPRuntimeRemoteHookKeys.QueryExecute,
  async execute(payload) {
    if (payload.handled) {
      return payload;
    }
    const api = inject(AXCRuntimeApiService);
    const response = await api.executeQuery(payload.name, payload.input, payload.options);
    // Keep the wire envelope — same contract as local AXPQuery.fetch / command execute.
    return {
      ...payload,
      handled: true,
      result: response,
    };
  },
};

export const AXC_RUNTIME_REMOTE_HOOK_PROVIDERS: Provider[] = [
  AXCRuntimeQueryCacheService,
  AXCRuntimeApiService,
  {
    provide: AXP_DISTRIBUTED_EVENT_LISTENER_PROVIDER,
    useValue: AXCRuntimeCommandExecuteHookProvider,
    multi: true,
  },
  {
    provide: AXP_DISTRIBUTED_EVENT_LISTENER_PROVIDER,
    useValue: AXCRuntimeCommandExecuteBulkHookProvider,
    multi: true,
  },
  {
    provide: AXP_DISTRIBUTED_EVENT_LISTENER_PROVIDER,
    useValue: AXCRuntimeQueryExecuteHookProvider,
    multi: true,
  },
];

//#endregion
