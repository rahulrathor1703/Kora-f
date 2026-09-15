import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';
import {
  countActiveSecondaryFilters,
  getActiveSecondaryFilters,
} from '@/lib/crm/prospects/filter-config';
import { PIPELINE_STAGE_FIELD_KEY } from '@/lib/crm/pipeline/constants';

/** Always shown inline on the pipeline toolbar (not configurable). */
export const PIPELINE_PRIMARY_FILTER_KEYS = ['emailStatus'] as const;

export type PipelinePrimaryFilterKey =
  (typeof PIPELINE_PRIMARY_FILTER_KEYS)[number];

const PIPELINE_EXCLUDED_FILTER_KEYS = new Set<string>([
  PIPELINE_STAGE_FIELD_KEY,
]);

function isPipelinePrimaryFilterKey(key: string): key is PipelinePrimaryFilterKey {
  return (PIPELINE_PRIMARY_FILTER_KEYS as readonly string[]).includes(key);
}

function isPipelineFilterFieldType(field: ProspectFieldDefinition): boolean {
  return field.type === 'select' || field.type === 'multiselect';
}

export function isPipelineFilterCandidate(field: ProspectFieldDefinition): boolean {
  return (
    isPipelineFilterFieldType(field) &&
    !PIPELINE_EXCLUDED_FILTER_KEYS.has(field.key) &&
    !isPipelinePrimaryFilterKey(field.key)
  );
}

export function splitPipelineFilterableFields(fields: ProspectFieldDefinition[]) {
  const primary = PIPELINE_PRIMARY_FILTER_KEYS.map((key) =>
    fields.find((field) => field.key === key),
  ).filter(
    (field): field is ProspectFieldDefinition =>
      field !== undefined && isPipelineFilterFieldType(field),
  );

  const secondary = fields.filter(
    (field) =>
      field.filterable &&
      isPipelineFilterCandidate(field),
  );

  return { primary, secondary };
}

export {
  countActiveSecondaryFilters,
  getActiveSecondaryFilters,
};
