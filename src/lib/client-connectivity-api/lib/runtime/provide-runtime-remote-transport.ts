//#region ----- Imports -----

import type { Provider } from '@angular/core';
import { AXC_RUNTIME_REMOTE_HOOK_PROVIDERS } from './runtime-remote.hooks';

//#endregion

//#region ----- Provider factory -----

/**
 * Nest / demo-api CQRS transport: `runtime.query.execute`, `runtime.command.execute`,
 * and `runtime.command.execute-bulk` against `{AXP_ROOT_CONFIG_TOKEN.baseUrl}/v1/runtime/*`.
 *
 * Official hosts that import `AXMSettingsManagementModule` get this automatically.
 * Custom API stacks should use `provideExternalRuntimeQueryTransport` /
 * `provideExternalRuntimeCommandTransport` / `provideExternalRuntimeBulkTransport` instead.
 */
export function provideRuntimeRemoteTransport(): Provider[] {
  return [...AXC_RUNTIME_REMOTE_HOOK_PROVIDERS];
}

//#endregion
