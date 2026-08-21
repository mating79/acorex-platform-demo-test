import type {
  AXPRuntimeCommandResult,
  
  AXPRuntimeQueryResult,
} from '@acorex-platform/framework-shared/core';
import type {
  AXPBulkCommandRequest,
  AXPBulkCommandResultData,
} from '@acorex-platform/framework-shared/runtime';

//#region ---- Runtime API response shapes ----

/** Mirrors server `RuntimeQueryResult` / {@link AXPRuntimeQueryResult}. */
export type AXCRuntimeQueryResult = AXPRuntimeQueryResult;

export type AXCRuntimeCommandResult = AXPRuntimeCommandResult;

export type AXCRuntimeBulkCommandRequest = AXPBulkCommandRequest;
export type AXCRuntimeBulkCommandResult = AXPRuntimeCommandResult<AXPBulkCommandResultData>;

//#endregion
