//#region ----- Stable Request Serialization -----

/**
 * Serializes JSON-like query input with object keys sorted recursively.
 * Equivalent inputs produce the same cache key regardless of property insertion order.
 */
export function stableSerializeRuntimeQueryInput(value: unknown): string {
  return JSON.stringify(normalizeValue(value, new WeakSet<object>())) ?? 'undefined';
}

function normalizeValue(value: unknown, ancestors: WeakSet<object>): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return value.toJSON();
  }

  if (ancestors.has(value)) {
    throw new TypeError('Runtime query input must not contain circular references');
  }

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item) => normalizeValue(item, ancestors));
    }

    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((normalized, key) => {
        const item = record[key];
        if (item !== undefined) {
          normalized[key] = normalizeValue(item, ancestors);
        }
        return normalized;
      }, {});
  } finally {
    ancestors.delete(value);
  }
}

//#endregion
