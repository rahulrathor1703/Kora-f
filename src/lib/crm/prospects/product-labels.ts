import type { FieldStoredValue } from '@/lib/crm/location/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

export function normalizeMultiSelectValue(
  rawValue: FieldStoredValue | undefined,
): string[] {
  if (rawValue === null || rawValue === undefined) {
    return [];
  }

  if (Array.isArray(rawValue)) {
    return rawValue.map(String).filter((item) => item.length > 0);
  }

  if (typeof rawValue === 'string' && rawValue.trim().length > 0) {
    return [rawValue.trim()];
  }

  return [];
}

export function resolveProductLabels(
  productField: ProspectFieldDefinition | undefined,
  rawValue: FieldStoredValue | undefined,
  fallback: string,
): string {
  const values = normalizeMultiSelectValue(rawValue);

  if (values.length === 0) {
    return fallback;
  }

  return values
    .map((value) => {
      const option = productField?.options?.find((item) => item.value === value);
      return option?.label ?? value;
    })
    .join(', ');
}
