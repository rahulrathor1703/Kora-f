import { LEAD_STATUS_FIELD_KEY } from '@/lib/crm/pipeline/constants';
import { findPipelineStageField } from '@/lib/crm/prospects/pipeline-field.utils';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

function field(
  partial: Partial<ProspectFieldDefinition> & Pick<ProspectFieldDefinition, 'key'>,
): ProspectFieldDefinition {
  return {
    id: '00000000-0000-4000-8000-000000000099',
    label: partial.label ?? partial.key,
    type: partial.type ?? 'select',
    sortOrder: partial.sortOrder ?? 0,
    showInTable: partial.showInTable ?? true,
    showInForm: partial.showInForm ?? true,
    ...partial,
  };
}

describe('findPipelineStageField', () => {
  it('prefers pipelineStage flag over leadStatus key fallback', () => {
    const fields = [
      field({ key: LEAD_STATUS_FIELD_KEY, pipelineStage: false }),
      field({ key: 'custom_stage', pipelineStage: true }),
    ];

    expect(findPipelineStageField(fields)?.key).toBe('custom_stage');
  });

  it('falls back to leadStatus when no pipelineStage field exists', () => {
    const fields = [field({ key: LEAD_STATUS_FIELD_KEY, pipelineStage: true })];

    expect(findPipelineStageField(fields)?.key).toBe(LEAD_STATUS_FIELD_KEY);
  });
});
