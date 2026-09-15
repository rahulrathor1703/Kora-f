import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

export const PRIMARY_FILTER_KEYS = ['crmStatus', 'emailStatus'] as const;

export type PrimaryFilterKey = (typeof PRIMARY_FILTER_KEYS)[number];

function isPrimaryFilterKey(key: string): key is PrimaryFilterKey {
  return (PRIMARY_FILTER_KEYS as readonly string[]).includes(key);
}

export function splitFilterableFields(fields: ProspectFieldDefinition[]) {
  const filterable = fields.filter(
    (field) =>
      field.filterable &&
      (field.type === 'select' || field.type === 'multiselect'),
  );

  const primary = PRIMARY_FILTER_KEYS.map((key) =>
    filterable.find((field) => field.key === key),
  ).filter((field): field is ProspectFieldDefinition => field !== undefined);

  const secondary = filterable.filter((field) => !isPrimaryFilterKey(field.key));

  return { primary, secondary };
}

export function countActiveSecondaryFilters(
  filters: Record<string, string>,
  secondaryFields: ProspectFieldDefinition[],
): number {
  const secondaryKeys = new Set(secondaryFields.map((field) => field.key));

  return Object.entries(filters).filter(
    ([key, value]) => secondaryKeys.has(key) && value.trim().length > 0,
  ).length;
}

export function getActiveSecondaryFilters(
  filters: Record<string, string>,
  secondaryFields: ProspectFieldDefinition[],
) {
  const secondaryKeys = new Set(secondaryFields.map((field) => field.key));

  return Object.entries(filters).filter(
    ([key, value]) => secondaryKeys.has(key) && value.trim().length > 0,
  );
}
