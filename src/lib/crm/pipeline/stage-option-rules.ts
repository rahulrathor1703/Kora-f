import { PROTECTED_PIPELINE_STAGE_VALUE } from '@/lib/crm/pipeline/constants';
import type { FormFieldOption } from '@/lib/forms/types';

/** Published platform lead-status values (baseline); used when API omits option.source. */
export const PLATFORM_PIPELINE_STAGE_VALUES = [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost',
  'nurture',
] as const;

const platformValueSet = new Set<string>(PLATFORM_PIPELINE_STAGE_VALUES);

export function isOrgOwnedPipelineStageOption(
  option: Pick<FormFieldOption, 'value' | 'source'>,
): boolean {
  if (option.source === 'org') {
    return true;
  }

  if (option.source === 'platform') {
    return false;
  }

  return !platformValueSet.has(option.value);
}

export function canDeletePipelineStageOption(
  option: Pick<FormFieldOption, 'value' | 'source'>,
): boolean {
  if (option.value === PROTECTED_PIPELINE_STAGE_VALUE) {
    return false;
  }

  return isOrgOwnedPipelineStageOption(option);
}

export function isPipelineStageOptionValueLocked(
  option: Pick<FormFieldOption, 'value' | 'source'>,
): boolean {
  return !isOrgOwnedPipelineStageOption(option);
}
