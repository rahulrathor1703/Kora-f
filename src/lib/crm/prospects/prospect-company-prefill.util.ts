import {
  isProspectCompanyDetailsField,
} from '@/lib/crm/prospects/prospect-lead-type-fields.util';
import { getCompanyPickerLabel } from '@/lib/crm/companies/company-picker-label.util';
import type { Company } from '@/lib/crm/companies/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';
import {
  isLocationValue,
  type FieldStoredValue,
} from '@/lib/crm/location/types';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';

/** Company value keys that must not copy onto a prospect. */
const COMPANY_PREFILL_DENYLIST = new Set(['companyId', 'createdDate']);

const PROSPECT_COMPANY_NAME_FIELD_KEY = 'company';

function isCopyableStoredValue(
  field: ProspectFieldDefinition,
  value: FieldStoredValue | undefined,
): value is FieldStoredValue {
  if (value === undefined) {
    return false;
  }

  if (field.type === 'location') {
    return isLocationValue(value);
  }

  if (field.type === 'multiselect') {
    return Array.isArray(value);
  }

  if (value === null) {
    return true;
  }

  if (typeof value === 'object') {
    return false;
  }

  return true;
}

function readCompanyFieldValue(
  company: Company,
  fieldKey: string,
): FieldStoredValue | undefined {
  if (fieldKey === PROSPECT_COMPANY_NAME_FIELD_KEY) {
    const name = getCompanyPickerLabel(company).trim();
    return name || undefined;
  }

  if (COMPANY_PREFILL_DENYLIST.has(fieldKey)) {
    return undefined;
  }

  return company.values[fieldKey];
}

export function buildProspectPrefillFromCompany(
  company: Company,
  layoutFields: ProspectFieldDefinition[],
): Record<string, FieldStoredValue> {
  const patch: Record<string, FieldStoredValue> = {};

  for (const field of layoutFields) {
    if (isSectionFieldType(field.type)) {
      continue;
    }

    if (!isProspectCompanyDetailsField(field, layoutFields)) {
      continue;
    }

    const raw = readCompanyFieldValue(company, field.key);
    if (!isCopyableStoredValue(field, raw)) {
      continue;
    }

    patch[field.key] = raw;
  }

  return patch;
}

/** Default empty values for company-details fields (used when clearing selection). */
export function buildEmptyProspectCompanySectionValues(
  layoutFields: ProspectFieldDefinition[],
): Record<string, FieldStoredValue> {
  const patch: Record<string, FieldStoredValue> = {};

  for (const field of layoutFields) {
    if (isSectionFieldType(field.type)) {
      continue;
    }

    if (!isProspectCompanyDetailsField(field, layoutFields)) {
      continue;
    }

    if (field.type === 'location') {
      patch[field.key] = {
        city: null,
        state: null,
        country: null,
        region: null,
      };
      continue;
    }

    if (field.type === 'multiselect') {
      patch[field.key] = [];
      continue;
    }

    patch[field.key] = null;
  }

  return patch;
}
