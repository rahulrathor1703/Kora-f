import {
  BROKER_NAME_FIELD_KEY,
  type Company,
  type CompanyFieldDefinition,
  type CreateCompanyInput,
  type UpdateCompanyInput,
} from '@/lib/crm/companies/types';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import {
  buildLocationDisplayLabel,
  emptyLocationValue,
  isEmptyLocationValue,
  isLocationValue,
  normalizeLocationComponents,
  type FieldStoredValue,
  type LocationValue,
} from '@/lib/crm/location/types';

export interface CompanyDraftValues {
  brokerName: string;
  values: Record<string, FieldStoredValue>;
}

export function getFieldStringValue(
  values: Record<string, FieldStoredValue>,
  key: string,
): string {
  const value = values[key];
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value);
}

export function getFieldLocationValue(
  values: Record<string, FieldStoredValue>,
  key: string,
): LocationValue {
  const value = values[key];
  if (isLocationValue(value)) {
    return value;
  }

  return emptyLocationValue();
}

export function companyToDraftValues(company: Company): CompanyDraftValues {
  const values: Record<string, FieldStoredValue> = { ...company.values };

  return {
    brokerName: company.brokerName,
    values,
  };
}

function serializeFieldValue(
  field: CompanyFieldDefinition,
  rawValue: FieldStoredValue,
): FieldStoredValue {
  if (field.type === 'location') {
    const value = isLocationValue(rawValue) ? rawValue : emptyLocationValue();
    return isEmptyLocationValue(value) ? emptyLocationValue() : value;
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof rawValue === 'number') {
    return rawValue;
  }

  return null;
}

export function draftValuesToCreateInput(
  draft: CompanyDraftValues,
  fields: CompanyFieldDefinition[],
): CreateCompanyInput {
  const values: Record<string, FieldStoredValue> = {};

  for (const field of fields) {
    if (field.key === BROKER_NAME_FIELD_KEY || isSectionFieldType(field.type)) {
      continue;
    }

    values[field.key] = serializeFieldValue(
      field,
      draft.values[field.key] ?? null,
    );
  }

  return {
    brokerName: draft.brokerName.trim(),
    values,
  };
}

export function draftValuesToUpdateInput(
  draft: CompanyDraftValues,
  fields: CompanyFieldDefinition[],
  fieldKey?: string,
): UpdateCompanyInput {
  if (fieldKey === BROKER_NAME_FIELD_KEY || !fieldKey) {
    const full = draftValuesToCreateInput(draft, fields);

    if (fieldKey === BROKER_NAME_FIELD_KEY) {
      return { brokerName: full.brokerName };
    }

    return full;
  }

  const field = fields.find((item) => item.key === fieldKey);
  if (!field) {
    return {};
  }

  return {
    values: {
      [fieldKey]: serializeFieldValue(field, draft.values[fieldKey] ?? null),
    },
  };
}

export function validateRequiredCompanyFields(
  draft: CompanyDraftValues,
  fields: CompanyFieldDefinition[],
): string | null {
  for (const field of fields) {
    if (isSectionFieldType(field.type)) {
      continue;
    }

    if (!field.required) {
      continue;
    }

    if (field.key === BROKER_NAME_FIELD_KEY) {
      if (!draft.brokerName.trim()) {
        return `${field.label} is required`;
      }
      continue;
    }

    if (field.type === 'location') {
      const value = getFieldLocationValue(draft.values, field.key);
      if (isEmptyLocationValue(value)) {
        return `${field.label} is required`;
      }
      continue;
    }

    if (!getFieldStringValue(draft.values, field.key).trim()) {
      return `${field.label} is required`;
    }
  }

  return null;
}

export function formatCompanyFieldDisplayValue(
  field: CompanyFieldDefinition,
  value: FieldStoredValue | undefined,
): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (field.type === 'location' && isLocationValue(value)) {
    return buildLocationDisplayLabel(
      value,
      normalizeLocationComponents(field.locationComponents),
    );
  }

  return String(value);
}

export function getFilterableCompanyFields(fields: CompanyFieldDefinition[]) {
  return fields.filter((field) => field.filterable);
}

export function getCompanyTableFields(fields: CompanyFieldDefinition[]) {
  return [...fields]
    .filter((field) => field.showInTable && !isSectionFieldType(field.type))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getCompanyFormFields(fields: CompanyFieldDefinition[]) {
  return [...fields]
    .filter((field) => field.showInForm && field.key !== 'brokerName')
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getCompanyDetailFields(fields: CompanyFieldDefinition[]) {
  return [...fields]
    .filter(
      (field) =>
        !isSectionFieldType(field.type) &&
        (field.editableOnDetail !== false ||
          field.key === 'brokerName' ||
          field.system),
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function flattenCompanyForTable(company: {
  id: string;
  brokerName: string;
  values: Record<string, FieldStoredValue>;
  createdAt: string;
}): Record<string, unknown> {
  return {
    id: company.id,
    brokerName: company.brokerName,
    createdAt: company.createdAt,
    ...company.values,
  };
}
