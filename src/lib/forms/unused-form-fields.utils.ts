import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import { PIPELINE_STAGE_FIELD_KEY } from '@/lib/crm/pipeline/constants';
import type { FormFieldDefinition } from '@/lib/forms/types';

/** Pipeline / table metrics — never part of the create-form layout or Unused Fields pool. */
const PROSPECT_FORM_TABLE_ONLY_FIELD_KEYS = new Set([
  PIPELINE_STAGE_FIELD_KEY,
  'emailStatus',
]);

/** Platform fields that stay off the form by design (not user-removed layout fields). */
export function isCatalogHiddenFromFormLayout(
  field: FormFieldDefinition,
): boolean {
  if (field.pipelineStage) {
    return true;
  }

  return PROSPECT_FORM_TABLE_ONLY_FIELD_KEYS.has(field.key);
}

/** Fields the user removed from the layout (not the full schema catalog). */
export function isUnusedFormField(field: FormFieldDefinition): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  if (field.showInForm !== false) {
    return false;
  }

  if (isCatalogHiddenFromFormLayout(field)) {
    return false;
  }

  return true;
}

export function listUnusedFormFields(fields: FormFieldDefinition[]): FormFieldDefinition[] {
  return fields.filter(isUnusedFormField);
}
