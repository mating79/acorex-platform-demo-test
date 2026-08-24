import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import {
  AXPIdentifierRuleRepository,
  AXPIdentifierService,
  AXPSimplePatternEngine,
  buildScopeHash,
  uuid,
  type AXPChecksumProvider,
  type AXPIdentifierPeekResult,
  type AXPIdentifierRequest,
  type AXPIdentifierResult,
  type AXPSequenceProvider,
} from '@acorex-platform/module-identifier-management-client';

interface PendingCommit {
  req: AXPIdentifierRequest;
  code: string;
  ruleId: string;
  scopeHash: string;
}

@Injectable({ providedIn: 'root' })
export class AXCLocalIdentifierService extends AXPIdentifierService {
  private readonly ruleRepository = inject(AXPIdentifierRuleRepository);
  private readonly injector = inject(Injector);
  private readonly sequences = new Map<string, number>();
  private readonly pendingCommits = new Map<string, PendingCommit>();

  private readonly checksum: AXPChecksumProvider = {
    compute: (algo, input) =>
      algo === 'mod11' ? computeMod11CheckDigit(input) : computeLuhnCheckDigit(input),
  };

  private readonly sequence: AXPSequenceProvider = {
    next: async (scopeHash, ruleId, options) => {
      const key = `${scopeHash}|${ruleId}`;
      const current = this.sequences.get(key) ?? 0;
      const next = current + 1;
      if (options?.consume !== false) {
        this.sequences.set(key, next);
      }
      return next;
    },
  };

  async generate(req: AXPIdentifierRequest): Promise<AXPIdentifierResult> {
    const evaluated = await this.evaluate(req, 'commit');
    return { ...evaluated, consumed: true };
  }

  async peek(req: AXPIdentifierRequest): Promise<AXPIdentifierPeekResult> {
    const evaluated = await this.evaluate(req, 'preview');
    const commitToken = uuid();
    this.pendingCommits.set(commitToken, {
      req,
      code: evaluated.code,
      ruleId: evaluated.ruleId,
      scopeHash: evaluated.scopeHash,
    });
    return { ...evaluated, consumed: false, commitToken };
  }

  async validate(_code: string, _entity: string, _tenantId?: string): Promise<boolean> {
    return true;
  }

  async commitWithToken(token: string): Promise<AXPIdentifierResult> {
    const pending = this.pendingCommits.get(token);
    if (!pending) {
      throw new Error(`Unknown identifier commit token: ${token}`);
    }
    this.pendingCommits.delete(token);
    await this.evaluate(pending.req, 'commit');
    return {
      code: pending.code,
      ruleId: pending.ruleId,
      scopeHash: pending.scopeHash,
      consumed: true,
    };
  }

  async commitByCode(req: AXPIdentifierRequest, code: string): Promise<AXPIdentifierResult> {
    const rule = await this.ruleRepository.findById(req.id);
    const ruleId = rule?.name ?? req.id;
    const scopeHash = buildScopeHash([req.tenantId, req.appId, ruleId]);
    return { code, ruleId, scopeHash, consumed: true };
  }

  private async evaluate(
    req: AXPIdentifierRequest,
    mode: 'preview' | 'commit',
  ): Promise<Omit<AXPIdentifierResult, 'consumed'>> {
    const rule = await this.ruleRepository.findById(req.id);
    const ruleId = rule?.name ?? req.id;
    const scopeHash = buildScopeHash([req.tenantId, req.appId, ruleId]);
    const pattern = rule?.pattern ?? `{const:${req.id}}`;

    const engine = runInInjectionContext(this.injector, () => new AXPSimplePatternEngine());
    const compiled = engine.compile(pattern);
    const code = await engine.evaluate(compiled, {
      pattern,
      request: req,
      cache: new Map<string, unknown>([
        ['ruleId', ruleId],
        ['scopeHash', scopeHash],
      ]),
      now: new Date(),
      services: {
        sequence: this.sequence,
        checksum: this.checksum,
        clock: { now: () => new Date() },
      },
      evaluationMode: mode,
    });

    return { code, ruleId, scopeHash };
  }
}

function computeLuhnCheckDigit(input: string): string {
  const digits = input.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = true;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return String((10 - (sum % 10)) % 10);
}

function computeMod11CheckDigit(input: string): string {
  const digits = input.replace(/\D/g, '');
  let sum = 0;
  let weight = 2;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    sum += Number(digits[i]) * weight;
    weight = weight === 7 ? 2 : weight + 1;
  }
  const mod = sum % 11;
  const check = 11 - mod;
  return check === 10 ? 'X' : check === 11 ? '0' : String(check);
}
