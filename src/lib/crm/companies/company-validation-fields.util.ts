import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import { CRM_COMPANY_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import { filterFieldsForLayoutCanvas } from '@/lib/forms/layout-canvas-fields.utils';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';

export type CompanyValidationFieldMode = 'liveCreate' | 'full';

/** Mirrors backend `filterCompanyLiveCreateFields`. */
export function filterCompanyLiveCreateFields(
  fields: CompanyFieldDefinition[],
): CompanyFieldDefinition[] {
  return fields.filter((field) => {
    if (isSectionFieldType(field.type)) {
      return false;
    }

    if (!field.sectionId) {
      return false;
    }

    return field.showInForm !== false;
  });
}

export function filterCompanyFullValidationFields(
  fields: CompanyFieldDefinition[],
): CompanyFieldDefinition[] {
  return fields.filter((field) => !isSectionFieldType(field.type));
}

export function getCompanyValidationFields(
  fields: CompanyFieldDefinition[],
  options: {
    mode: CompanyValidationFieldMode;
    formKey?: string;
  },
): CompanyFieldDefinition[] {
  const formKey = options.formKey ?? CRM_COMPANY_CREATE_FORM_KEY;

  return options.mode === 'liveCreate'
    ? filterCompanyLiveCreateFields(
        filterFieldsForLayoutCanvas(
          formKey,
          fields,
        ) as CompanyFieldDefinition[],
      )
    : filterCompanyFullValidationFields(fields);
}
