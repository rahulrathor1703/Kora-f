import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import {
  CRM_COMPANY_CREATE_FORM_KEY,
  CRM_PROSPECT_CREATE_FORM_KEY,
} from '@/lib/forms/crm-form-keys';
import type { FormFieldDefinition } from '@/lib/forms/types';

function usesCrmLayoutCanvas(formKey: string | undefined): boolean {
  return (
    formKey === CRM_PROSPECT_CREATE_FORM_KEY ||
    formKey === CRM_COMPANY_CREATE_FORM_KEY
  );
}

/** Fields shown on the module layout canvas during CRM form redesign. */
export function filterFieldsForLayoutCanvas(
  formKey: string | undefined,
  fields: FormFieldDefinition[],
): FormFieldDefinition[] {
  if (!usesCrmLayoutCanvas(formKey)) {
    return fields;
  }

  return fields.filter((field) => {
    if (isSectionFieldType(field.type)) {
      return true;
    }

    if (!field.sectionId) {
      return false;
    }

    // Company identity (`brokerName`) is system but must follow the layout canvas.
    if (field.system && formKey !== CRM_COMPANY_CREATE_FORM_KEY) {
      return false;
    }

    return field.showInForm !== false;
  });
}

/** Fields rendered on CRM create forms (matches Manage Forms layout canvas). */
export function getFieldsForLiveCreateForm(
  formKey: string | undefined,
  fields: FormFieldDefinition[],
): FormFieldDefinition[] {
  return filterFieldsForLayoutCanvas(formKey, fields)
    .filter(
      (field) => isSectionFieldType(field.type) || field.showInForm !== false,
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
