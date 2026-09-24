import { findPipelineStageField } from '@/lib/crm/prospects/pipeline-field.utils';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

const LEAD_STATUS_FIELD_KEY = 'leadStatus';

const PROSPECT_LIST_EXCLUDED_FILTER_KEYS = new Set(['emailStatus']);

function isFilterableSelectField(field: ProspectFieldDefinition): boolean {
  return (
    Boolean(field.filterable) &&
    (field.type === 'select' || field.type === 'multiselect')
  );
}

function findPrimaryStatusField(
  fields: ProspectFieldDefinition[],
  filterable: ProspectFieldDefinition[],
): ProspectFieldDefinition | undefined {
  const leadStatus = filterable.find((field) => field.key === LEAD_STATUS_FIELD_KEY);
  if (leadStatus) {
    return leadStatus;
  }

  const stageField = findPipelineStageField(fields);
  if (
    stageField &&
    isFilterableSelectField(stageField) &&
    filterable.some((field) => field.key === stageField.key)
  ) {
    return stageField;
  }

  return undefined;
}

export function splitFilterableFields(fields: ProspectFieldDefinition[]) {
  const filterable = fields.filter(
    (field) =>
      isFilterableSelectField(field) &&
      !PROSPECT_LIST_EXCLUDED_FILTER_KEYS.has(field.key),
  );

  const primaryField = findPrimaryStatusField(fields, filterable);
  const primaryKeys = new Set(primaryField ? [primaryField.key] : []);
  const primary = primaryField ? [primaryField] : [];

  const secondary = filterable.filter((field) => !primaryKeys.has(field.key));

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
