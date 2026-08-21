import {
  AXPAccessPolicyCachePort,
  AXPSessionContext,
  traceAuthAccessPolicy,
} from '@acorex-platform/framework-client/auth';
import { AXPQueryService } from '@acorex-platform/framework-client/runtime';
import { runtimeQueryPayloadData } from '@acorex-platform/framework-shared/core';
import { AUTH_GET_ACCESS_POLICY_DEFAULT } from '@acorex-platform/framework-shared/runtime';
import { Injectable, inject } from '@angular/core';
import { buildAccessPolicyCacheKey } from './feature-policy.util';
import { AXPSessionAccessPolicy } from './access-policy.types';

//#region ----- Service -----

/**
 * Fetches and caches session access policy via runtime query for the current session context.
 */
@Injectable({ providedIn: 'root' })
export class AXPAccessPolicyService implements AXPAccessPolicyCachePort {
  private readonly queryService = inject(AXPQueryService);

  private cache: { key: string; policy: AXPSessionAccessPolicy } | null = null;
  private fetchInFlight: { key: string; promise: Promise<AXPSessionAccessPolicy> } | null = null;

  invalidate(): void {
    this.cache = null;
    this.fetchInFlight = null;
  }

  async getPermissions(context: AXPSessionContext): Promise<string[]> {
    const policy = await this.getPolicy(context);
    return policy.permissions ?? [];
  }

  async getModulesAndFeatures(
    context: AXPSessionContext,
  ): Promise<AXPSessionAccessPolicy['modulesAndFeatures']> {
    const policy = await this.getPolicy(context);
    return policy.modulesAndFeatures;
  }

  private async getPolicy(context: AXPSessionContext): Promise<AXPSessionAccessPolicy> {
    const key = buildAccessPolicyCacheKey(context);
    if (this.cache?.key === key) {
      traceAuthAccessPolicy('Access policy cache hit', () => ({ key }));
      return this.cache.policy;
    }

    if (this.fetchInFlight?.key === key) {
      traceAuthAccessPolicy('Access policy in-flight join', () => ({ key }));
      return this.fetchInFlight.promise;
    }

    const promise = this.fetchPolicy(key);
    this.fetchInFlight = { key, promise };

    try {
      return await promise;
    } finally {
      if (this.fetchInFlight?.promise === promise) {
        this.fetchInFlight = null;
      }
    }
  }

  private async fetchPolicy(key: string): Promise<AXPSessionAccessPolicy> {
    const startedAt = Date.now();
    traceAuthAccessPolicy('Auth:GetAccessPolicy request', () => ({ key }));
    const result = await this.queryService.fetch<void, AXPSessionAccessPolicy>(
      AUTH_GET_ACCESS_POLICY_DEFAULT,
      undefined as void,
    );
    const policy = runtimeQueryPayloadData(result);
    if (!policy) {
      throw new Error('Access policy query returned no data');
    }
    this.cache = { key, policy };
    traceAuthAccessPolicy('Auth:GetAccessPolicy response', () => ({
      key,
      ms: Date.now() - startedAt,
      permissionCount: policy.permissions?.length ?? 0,
    }));
    return policy;
  }
}

//#endregion
