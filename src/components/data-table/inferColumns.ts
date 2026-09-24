const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

function isScalarValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

export function inferColumnsFromRows<T extends object>(
  rows: T[],
  excludeFields: string[] = [],
): string[] {
  const excluded = new Set(excludeFields);
  const fields: string[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    for (const [field, value] of Object.entries(
      row as Record<string, unknown>,
    )) {
      if (excluded.has(field) || seen.has(field) || !isScalarValue(value)) {
        continue;
      }

      seen.add(field);
      fields.push(field);
    }
  }

  return fields;
}

export function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE_PATTERN.test(value);
}
