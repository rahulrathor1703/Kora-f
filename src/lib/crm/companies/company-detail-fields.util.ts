import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import { CRM_COMPANY_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import { getFieldsForLiveCreateForm } from '@/lib/forms/layout-canvas-fields.utils';
import { BROKER_NAME_FIELD_KEY, type CompanyFieldDefinition } from '@/lib/crm/companies/types';

/** Identity field shown in the page header, not the overview layout. */
const COMPANY_OVERVIEW_HEADER_FIELD_KEYS = new Set([BROKER_NAME_FIELD_KEY]);

/** Not editable on company detail overview. */
export const COMPANY_DETAIL_READ_ONLY_FIELD_KEYS = new Set([
  'companyId',
  'createdDate',
  'lastUpdated',
]);

export function getCompanyOverviewLayoutFields(
  fields: CompanyFieldDefinition[],
): CompanyFieldDefinition[] {
  return (
    getFieldsForLiveCreateForm(
      CRM_COMPANY_CREATE_FORM_KEY,
      fields,
    ) as CompanyFieldDefinition[]
  ).filter((field) => field.key !== BROKER_NAME_FIELD_KEY);
}

export function getCompanyOverviewDataFields(
  layoutFields: CompanyFieldDefinition[],
): CompanyFieldDefinition[] {
  return layoutFields.filter((field) => !isSectionFieldType(field.type));
}

export function isCompanyFieldEditableOnDetail(
  field: CompanyFieldDefinition,
): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  if (field.system) {
    return false;
  }

  if (COMPANY_OVERVIEW_HEADER_FIELD_KEYS.has(field.key)) {
    return false;
  }

  if (COMPANY_DETAIL_READ_ONLY_FIELD_KEYS.has(field.key)) {
    return false;
  }

  if (field.editableOnDetail === true) {
    return true;
  }

  if (field.editableOnDetail === false) {
    return false;
  }

  return Boolean(field.sectionId) && field.showInForm !== false;
}
