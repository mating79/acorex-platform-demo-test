//#region ----- Imports -----

import {
  AXPCommonSettings,
  AXPSettingsService,
  AXP_RUNTIME_QUERY_CACHE_DEFAULTS,
  coerceAXPSettingRawValueByKind,
} from '@acorex-platform/framework-client/common';
import { AXPDebugService } from '@acorex-platform/framework-client/core';
import type { AXPQueryExecuteOptions } from '@acorex-platform/framework-shared/runtime';
import { inject, Injectable } from '@angular/core';

import type { AXCRuntimeQueryResult } from './runtime-api.types';
import { stableSerializeRuntimeQueryInput } from './runtime-query-cache-key.util';

//#endregion

//#region ----- Types & Constants -----

interface AXCRuntimeQueryCacheEntry {
  expiresAt: number;
  originStack?: string;
  result: AXCRuntimeQueryResult;
  storedAt: number;
}

interface AXCRuntimeQueryInFlightEntry {
  originStack?: string;
  promise: Promise<AXCRuntimeQueryResult>;
  startedAt: number;
}

type AXCRuntimeQueryDuplicateType = 'in-flight-coalesced' | 'ttl-cache-hit';

interface AXCRuntimeQueryDuplicateStat {
  callerLabel?: string;
  coalescedCount: number;
  duplicateStacks: string[];
  firstAt: number;
  input: unknown;
  lastAt: number;
  maxOriginAgeMs: number;
  name: string;
  originStack?: string;
  reusedCount: number;
  target: string;
}

const MAX_CACHE_ENTRIES = 250;
const DEBUG_NAMESPACE = 'runtime-query-cache';

/** Duplicates are collected for this window, then reported as one line per request. */
const DUPLICATE_REPORT_WINDOW_MS = 1_000;
const MAX_TRACKED_DUPLICATE_REQUESTS = 50;
const MAX_STACK_FRAMES = 8;
const MAX_DUPLICATE_STACK_SAMPLES = 3;
const MAX_TARGET_LENGTH = 120;
const MAX_FILTER_FIELDS = 3;
const MAX_FILTER_DEPTH = 3;

/** Gateway frames that hide the real caller in captured stacks. */
const GATEWAY_STACK_FRAME_PATTERN =
  /AXCRuntimeQueryCacheService|AXCRuntimeApiService\.(executeQuery|sendQuery)|runtime-query-cache/;

/** Async/zone plumbing frames that carry no call-site information. */
const PLUMBING_STACK_FRAME_PATTERN =
  /zone\.js|Zone[A-Za-z]*\.|ZoneAwarePromise|asyncGeneratorStep|_?asyncToGenerator|__awaiter|Generator\.|Object\.next|drainMicroTaskQueue|processTicksAndRejections/;

//#endregion

//#region ----- Runtime Query Cache -----

/**
 * Coalesces identical in-flight runtime queries and optionally reuses successful
 * responses for a short platform-configured TTL.
 */
@Injectable()
export class AXCRuntimeQueryCacheService {
  //#region ----- Services & Dependencies -----

  private readonly settings = inject(AXPSettingsService);
  private readonly debug = inject(AXPDebugService);

  //#endregion

  //#region ----- State -----

  private readonly inFlight = new Map<string, AXCRuntimeQueryInFlightEntry>();
  private readonly responses = new Map<string, AXCRuntimeQueryCacheEntry>();
  private readonly duplicates = new Map<string, AXCRuntimeQueryDuplicateStat>();
  private duplicateReportHandle: ReturnType<typeof setTimeout> | undefined;
  private generation = 0;

  //#endregion

  constructor() {
    this.settings.onLoaded.subscribe(() => this.clear());
    this.settings.onChanged.subscribe((event) => {
      if (
        event.keys.includes(AXPCommonSettings.RuntimeQueryCacheEnabled) ||
        event.keys.includes(AXPCommonSettings.RuntimeQueryCacheTtlMs)
      ) {
        this.clear();
      }
    });
  }

  //#region ----- Public API -----

  execute(
    name: string,
    input: unknown,
    request: () => Promise<AXCRuntimeQueryResult>,
    options?: AXPQueryExecuteOptions,
  ): Promise<AXCRuntimeQueryResult> {
    if (!this.isEnabled()) {
      return request();
    }

    const optionsKey =
      options != null && Object.keys(options).length > 0
        ? stableSerializeRuntimeQueryInput(options)
        : '';
    const key = `${name}|${stableSerializeRuntimeQueryInput(input ?? {})}|${optionsKey}`;
    const now = Date.now();
    const cached = this.responses.get(key);
    if (cached) {
      if (cached.expiresAt > now) {
        this.recordDuplicate({
          duplicateStack: this.captureCallerStack(),
          input,
          key,
          name,
          originAgeMs: now - cached.storedAt,
          originStack: cached.originStack,
          type: 'ttl-cache-hit',
        });
        return Promise.resolve(cached.result);
      }
      this.responses.delete(key);
    }

    const existing = this.inFlight.get(key);
    if (existing) {
      this.recordDuplicate({
        duplicateStack: this.captureCallerStack(),
        input,
        key,
        name,
        originAgeMs: now - existing.startedAt,
        originStack: existing.originStack,
        type: 'in-flight-coalesced',
      });
      return existing.promise;
    }

    const generation = this.generation;
    const ttlMs = this.getTtlMs();
    const originStack = this.captureCallerStack();
    const task = request()
      .then((result) => {
        if (
          result.success &&
          ttlMs > 0 &&
          generation === this.generation &&
          this.isEnabled()
        ) {
          this.storeResponse(key, result, ttlMs, originStack);
        }
        return result;
      })
      .finally(() => {
        if (this.inFlight.get(key)?.promise === task) {
          this.inFlight.delete(key);
        }
      });

    this.inFlight.set(key, {
      originStack,
      promise: task,
      startedAt: now,
    });
    return task;
  }

  /**
   * Invalidates completed responses and prevents older in-flight queries from
   * repopulating the cache after a command or configuration change.
   */
  clear(): void {
    this.generation += 1;
    this.responses.clear();
    this.inFlight.clear();
    this.reportDuplicates();
  }

  //#endregion

  //#region ----- Settings -----

  private isEnabled(): boolean {
    const raw = this.settings.peekCached(AXPCommonSettings.RuntimeQueryCacheEnabled);
    return raw === undefined
      ? AXP_RUNTIME_QUERY_CACHE_DEFAULTS.enabled
      : (coerceAXPSettingRawValueByKind(raw, 'boolean') as boolean);
  }

  private getTtlMs(): number {
    const raw = this.settings.peekCached(AXPCommonSettings.RuntimeQueryCacheTtlMs);
    const value =
      raw === undefined
        ? AXP_RUNTIME_QUERY_CACHE_DEFAULTS.ttlMs
        : (coerceAXPSettingRawValueByKind(raw, 'number') as number);
    return Number.isFinite(value) ? Math.max(0, value) : AXP_RUNTIME_QUERY_CACHE_DEFAULTS.ttlMs;
  }

  //#endregion

  //#region ----- Cache Maintenance -----

  private storeResponse(
    key: string,
    result: AXCRuntimeQueryResult,
    ttlMs: number,
    originStack?: string,
  ): void {
    this.pruneExpired();
    if (this.responses.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = this.responses.keys().next().value as string | undefined;
      if (oldestKey) {
        this.responses.delete(oldestKey);
      }
    }
    const storedAt = Date.now();
    this.responses.set(key, {
      result,
      expiresAt: storedAt + ttlMs,
      originStack,
      storedAt,
    });
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.responses) {
      if (entry.expiresAt <= now) {
        this.responses.delete(key);
      }
    }
  }

  //#endregion

  //#region ----- Debug Diagnostics -----

  private captureCallerStack(): string | undefined {
    if (!this.debug.isDebugMode()) {
      return undefined;
    }

    const frames = (new Error().stack?.split('\n') ?? [])
      .map((frame) => frame.trim())
      .filter(
        (frame) =>
          frame.length > 0 && frame !== 'Error' && !GATEWAY_STACK_FRAME_PATTERN.test(frame),
      );
    const callSites = frames.filter((frame) => !PLUMBING_STACK_FRAME_PATTERN.test(frame));
    const selected = (callSites.length > 0 ? callSites : frames).slice(0, MAX_STACK_FRAMES);

    return selected.length > 0 ? selected.join('\n') : undefined;
  }

  private recordDuplicate(details: {
    duplicateStack?: string;
    input: unknown;
    key: string;
    name: string;
    originAgeMs: number;
    originStack?: string;
    type: AXCRuntimeQueryDuplicateType;
  }): void {
    if (!this.debug.isDebugMode()) {
      return;
    }

    const now = Date.now();
    let stat = this.duplicates.get(details.key);
    if (!stat) {
      stat = {
        callerLabel: this.describeCaller(details.duplicateStack ?? details.originStack),
        coalescedCount: 0,
        duplicateStacks: [],
        firstAt: now,
        input: details.input,
        lastAt: now,
        maxOriginAgeMs: 0,
        name: details.name,
        originStack: details.originStack,
        reusedCount: 0,
        target: this.describeTarget(details.input),
      };
      this.duplicates.set(details.key, stat);
    }

    stat.lastAt = now;
    stat.maxOriginAgeMs = Math.max(stat.maxOriginAgeMs, Math.round(details.originAgeMs));
    if (details.type === 'in-flight-coalesced') {
      stat.coalescedCount += 1;
    } else {
      stat.reusedCount += 1;
    }

    if (
      details.duplicateStack &&
      stat.duplicateStacks.length < MAX_DUPLICATE_STACK_SAMPLES &&
      !stat.duplicateStacks.includes(details.duplicateStack)
    ) {
      stat.duplicateStacks.push(details.duplicateStack);
    }

    if (this.duplicates.size >= MAX_TRACKED_DUPLICATE_REQUESTS) {
      this.reportDuplicates();
      return;
    }

    this.duplicateReportHandle ??= setTimeout(
      () => this.reportDuplicates(),
      DUPLICATE_REPORT_WINDOW_MS,
    );
  }

  /** Emits one warning per duplicated request, with every key value inline in the message. */
  private reportDuplicates(): void {
    if (this.duplicateReportHandle !== undefined) {
      clearTimeout(this.duplicateReportHandle);
      this.duplicateReportHandle = undefined;
    }

    const stats = [...this.duplicates.values()].sort(
      (left, right) =>
        right.coalescedCount + right.reusedCount - (left.coalescedCount + left.reusedCount),
    );
    this.duplicates.clear();
    if (stats.length === 0) {
      return;
    }

    const totalCalls = stats.reduce(
      (total, stat) => total + stat.coalescedCount + stat.reusedCount,
      0,
    );

    if (stats.length > 1) {
      this.debug.warn(
        DEBUG_NAMESPACE,
        'duplicates',
        `${totalCalls} duplicate calls suppressed · ${stats.length} distinct requests · last ${DUPLICATE_REPORT_WINDOW_MS}ms`,
      );
    }

    for (const stat of stats) {
      const count = stat.coalescedCount + stat.reusedCount;
      const segments = [
        `×${count} duplicate ${count === 1 ? 'call' : 'calls'}`,
        stat.target,
        `coalesced ${stat.coalescedCount} / from memory ${stat.reusedCount}`,
        `burst ${Math.max(0, stat.lastAt - stat.firstAt)}ms`,
        `origin age ≤${stat.maxOriginAgeMs}ms`,
      ];
      if (stat.callerLabel) {
        segments.push(`caller ${stat.callerLabel}`);
      }

      this.debug.warn(DEBUG_NAMESPACE, stat.name, segments.join(' · '), () => ({
        duplicateStacks: stat.duplicateStacks,
        input: stat.input,
        originalCallStack: stat.originStack,
      }));
    }
  }

  /** First meaningful frame, e.g. `AXPLookupEditorWidgetColumn.loadTitle`. */
  private describeCaller(stack?: string): string | undefined {
    const frame = stack?.split('\n')[0];
    if (!frame) {
      return undefined;
    }

    return frame.match(/^at\s+([\w$.<>]+)/)?.[1] ?? frame.match(/^([\w$.<>]+)@/)?.[1];
  }

  private describeTarget(input: unknown): string {
    if (input === undefined || input === null) {
      return 'no input';
    }

    if (typeof input !== 'object') {
      return String(input);
    }

    const record = input as Record<string, unknown>;
    const pick = (...keys: string[]): string | undefined =>
      keys.map((key) => record[key]).find((value): value is string => typeof value === 'string');

    const entity = pick('entity', 'entityName', 'entityType');
    const id = pick('id', 'entityId', 'key');
    const view = pick('view', 'viewName', 'queryName');
    const filterFields = this.collectFilterFields(record['filter']);
    const segments = [
      entity,
      id ? `#${id.slice(0, 8)}` : undefined,
      view ? `view=${view}` : undefined,
      filterFields.length > 0 ? `filter=${filterFields.join(',')}` : undefined,
      typeof record['take'] === 'number' ? `take=${record['take']}` : undefined,
    ].filter((segment): segment is string => !!segment);
    if (segments.length > 0) {
      return segments.join(' ');
    }

    const serialized = stableSerializeRuntimeQueryInput(input);
    return serialized.length > MAX_TARGET_LENGTH
      ? `${serialized.slice(0, MAX_TARGET_LENGTH - 1)}…`
      : serialized;
  }

  private collectFilterFields(filter: unknown, depth = 0): string[] {
    if (depth > MAX_FILTER_DEPTH || filter == null || typeof filter !== 'object') {
      return [];
    }

    const record = filter as Record<string, unknown>;
    if (typeof record['field'] === 'string') {
      return [record['field']];
    }

    const nested = Array.isArray(record['filters']) ? (record['filters'] as unknown[]) : [];
    const fields = nested.flatMap((child) => this.collectFilterFields(child, depth + 1));
    return [...new Set(fields)].slice(0, MAX_FILTER_FIELDS);
  }

  //#endregion
}

//#endregion
