import { LEAD_STATUS_FIELD_KEY } from '@/lib/crm/pipeline/constants';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

export function findPipelineStageField(
  fields: ProspectFieldDefinition[],
): ProspectFieldDefinition | undefined {
  return (
    fields.find((field) => field.pipelineStage === true) ??
    fields.find((field) => field.key === LEAD_STATUS_FIELD_KEY)
  );
}
