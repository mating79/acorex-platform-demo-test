import { AXPRequestError } from '@acorex-platform/framework-shared/core';
import { toAXPRequestError } from '@acorex-platform/framework-client/common';

//#region ---- HTTP → AXPRequestError ----

/**
 * Normalize Angular HTTP failures into transport-agnostic {@link AXPRequestError}.
 * Call only from connectivity adapters (REST today; gRPC/GraphQL later).
 */
export function mapHttpErrorResponseToAXPRequestError(error: unknown): AXPRequestError {
  return toAXPRequestError(error);
}

//#endregion
