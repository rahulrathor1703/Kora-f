import {
  BROKER_NAME_FIELD_KEY,
  type Company,
  type CompanyConfigOption,
  type CompanyFieldDefinition,
  type CreateCompanyInput,
  type UpdateCompanyInput,
} from '@/lib/crm/companies/types';
import { getCompanyValidationFields } from '@/lib/crm/companies/company-validation-fields.util';
import { getCrmListTableColumnFields } from '@/lib/crm/fields/table-eligible-fields';
import { CRM_COMPANY_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import { getFieldsForLiveCreateForm } from '@/lib/forms/layout-canvas-fields.utils';
import { getFieldStringValidationError } from '@/lib/forms/field-string-validation.utils';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type { CompanyValidationFieldMode } from '@/lib/crm/companies/company-validation-fields.util';
import {
  buildLocationDisplayLabel,
  emptyLocationValue,
  isEmptyLocationValue,
  isLocationValue,
  normalizeLocationComponents,
  type FieldStoredValue,
  type LocationValue,
} from '@/lib/crm/location/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function isCompanyStringValidationField(
  field: CompanyFieldDefinition,
): boolean {
  return (
    field.type === 'text' ||
    field.type === 'textarea' ||
    field.type === 'phone'
  );
}

function isSelectOptionAllowed(
  field: CompanyFieldDefinition,
  value: string,
): boolean {
  return field.options?.some((option) => option.value === value) ?? false;
}

export interface ValidateCompanyFormValuesOptions {
  mode?: CompanyValidationFieldMode;
  categories?: CompanyConfigOption[];
  locations?: CompanyConfigOption[];
}

export function validateCompanyFormValues(
  fields: CompanyFieldDefinition[],
  draft: CompanyDraftValues,
  options?: ValidateCompanyFormValuesOptions,
): string | null {
  const mode = options?.mode ?? 'full';
  const validationContext = {
    categories: options?.categories,
    locations: options?.locations,
  };
  const applicableFields = getCompanyValidationFields(fields, { mode }).filter(
    (field) => field.key !== BROKER_NAME_FIELD_KEY,
  );

  for (const field of applicableFields) {
    const error = validateCompanyFieldValue(field, draft, validationContext);
    if (error) {
      return error;
    }
  }

  const liveCreateKeys = new Set(
    getCompanyValidationFields(fields, { mode: 'liveCreate' }).map(
      (field) => field.key,
    ),
  );
  const brokerField = fields.find((item) => item.key === BROKER_NAME_FIELD_KEY);
  const shouldValidateBroker =
    brokerField &&
    (mode === 'full' ||
      (mode === 'liveCreate' && liveCreateKeys.has(BROKER_NAME_FIELD_KEY)));

  if (shouldValidateBroker) {
    const brokerError = validateCompanyFieldValue(
      brokerField,
      draft,
      validationContext,
    );
    if (brokerError) {
      return brokerError;
    }
  }

  return null;
}

interface CompanyFieldValidationContext {
  categories?: CompanyConfigOption[];
  locations?: CompanyConfigOption[];
}

function validateCompanyFieldValue(
  field: CompanyFieldDefinition,
  draft: CompanyDraftValues,
  context: CompanyFieldValidationContext = {},
): string | null {
  if (isSectionFieldType(field.type)) {
    return null;
  }

  if (field.key === BROKER_NAME_FIELD_KEY) {
    const brokerName = draft.brokerName.trim();
    if (field.required && !brokerName) {
      return `${field.label} is required`;
    }

    if (brokerName) {
      const brokerValidationError = getFieldStringValidationError(
        {
          label: field.label,
          minLength: field.minLength,
          maxLength: field.maxLength,
          validationType: field.validationType,
        },
        brokerName,
      );
      if (brokerValidationError) {
        return brokerValidationError;
      }
    }
    return null;
  }

  if (field.type === 'location') {
    const value = getFieldLocationValue(draft.values, field.key);
    if (field.required && isEmptyLocationValue(value)) {
      return `${field.label} is required`;
    }
    return null;
  }

  if (field.type === 'select') {
    const stringValue = getFieldStringValue(draft.values, field.key).trim();
    if (field.required && !stringValue) {
      return `${field.label} is required`;
    }
    if (stringValue && !isSelectOptionAllowed(field, stringValue)) {
      return `Invalid value for ${field.label}`;
    }
    return null;
  }

  if (field.type === 'number') {
    const raw = draft.values[field.key];
    const stringValue = getFieldStringValue(draft.values, field.key).trim();
    if (field.required && stringValue === '') {
      return `${field.label} is required`;
    }
    if (stringValue !== '') {
      const numericValue =
        typeof raw === 'number' ? raw : Number(stringValue);
      if (Number.isNaN(numericValue)) {
        return `${field.label} must be a number`;
      }
    }
    return null;
  }

  if (field.type === 'date') {
    const stringValue = getFieldStringValue(draft.values, field.key).trim();
    if (field.required && !stringValue) {
      return `${field.label} is required`;
    }
    if (stringValue && Number.isNaN(Date.parse(stringValue))) {
      return `${field.label} must be a valid date`;
    }
    return null;
  }

  if (field.type === 'company-category') {
    const stringValue = getFieldStringValue(draft.values, field.key).trim();
    if (field.required && !stringValue) {
      return `${field.label} is required`;
    }
    if (stringValue) {
      if (!UUID_PATTERN.test(stringValue)) {
        return `Invalid value for ${field.label}`;
      }
      if (
        context.categories &&
        !context.categories.some((option) => option.id === stringValue)
      ) {
        return `Invalid value for ${field.label}`;
      }
    }
    return null;
  }

  if (field.type === 'company-location') {
    const stringValue = getFieldStringValue(draft.values, field.key).trim();
    if (field.required && !stringValue) {
      return `${field.label} is required`;
    }
    if (stringValue) {
      if (!UUID_PATTERN.test(stringValue)) {
        return `Invalid value for ${field.label}`;
      }
      if (
        context.locations &&
        !context.locations.some((option) => option.id === stringValue)
      ) {
        return `Invalid value for ${field.label}`;
      }
    }
    return null;
  }

  const stringValue = getFieldStringValue(draft.values, field.key).trim();

  if (field.required && !stringValue) {
    return `${field.label} is required`;
  }

  if (field.type === 'email' && stringValue) {
    if (!EMAIL_PATTERN.test(stringValue)) {
      return `${field.label} must be a valid email`;
    }
  }

  if (isCompanyStringValidationField(field) && stringValue) {
    const validationError = getFieldStringValidationError(
      {
        label: field.label,
        minLength: field.minLength,
        maxLength: field.maxLength,
        validationType: field.validationType,
      },
      stringValue,
    );
    if (validationError) {
      return validationError;
    }
  }

  return null;
}

/** @deprecated Use validateCompanyFormValues */
export function validateRequiredCompanyFields(
  draft: CompanyDraftValues,
  fields: CompanyFieldDefinition[],
): string | null {
  return validateCompanyFormValues(fields, draft, { mode: 'full' });
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

/** Non-section fields on the live create form (list column defaults). */
export function getCompanyTableFields(fields: CompanyFieldDefinition[]) {
  const formFields = getFieldsForLiveCreateForm(
    CRM_COMPANY_CREATE_FORM_KEY,
    fields,
  ).filter(
    (field) => !isSectionFieldType(field.type),
  ) as CompanyFieldDefinition[];

  return [...formFields].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getCompanyLiveCreateFormFields(
  fields: CompanyFieldDefinition[],
): CompanyFieldDefinition[] {
  return getFieldsForLiveCreateForm(
    CRM_COMPANY_CREATE_FORM_KEY,
    fields,
  ) as CompanyFieldDefinition[];
}

/** @deprecated Use getCompanyLiveCreateFormFields */
export function getCompanyFormFields(fields: CompanyFieldDefinition[]) {
  return getCompanyLiveCreateFormFields(fields).filter(
    (field) => !isSectionFieldType(field.type),
  );
}

/** @deprecated Use getCompanyOverviewLayoutFields from company-detail-fields.util */
export function getCompanyDetailFields(fields: CompanyFieldDefinition[]) {
  return [...getCrmListTableColumnFields(fields)].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
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
