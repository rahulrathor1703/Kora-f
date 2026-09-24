import {
  canDeletePipelineStageOption,
  isOrgOwnedPipelineStageOption,
  isPipelineStageOptionValueLocked,
} from '@/lib/crm/pipeline/stage-option-rules';

describe('pipeline stage option rules', () => {
  it('treats API source org as org-owned', () => {
    expect(
      isOrgOwnedPipelineStageOption({ value: 'eqweq', source: 'org' }),
    ).toBe(true);
    expect(canDeletePipelineStageOption({ value: 'eqweq', source: 'org' })).toBe(
      true,
    );
  });

  it('treats platform source as not org-owned', () => {
    expect(
      isOrgOwnedPipelineStageOption({ value: 'contacted', source: 'platform' }),
    ).toBe(false);
    expect(
      canDeletePipelineStageOption({ value: 'contacted', source: 'platform' }),
    ).toBe(false);
  });

  it('falls back to baseline values when source is missing', () => {
    expect(isOrgOwnedPipelineStageOption({ value: 'contacted' })).toBe(false);
    expect(isOrgOwnedPipelineStageOption({ value: 'custom' })).toBe(true);
    expect(isPipelineStageOptionValueLocked({ value: 'new' })).toBe(true);
    expect(canDeletePipelineStageOption({ value: 'new' })).toBe(false);
  });
});
