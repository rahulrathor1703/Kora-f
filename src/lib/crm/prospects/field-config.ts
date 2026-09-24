import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import { getCrmListTableDefaultColumnVisible } from '@/lib/crm/fields/table-eligible-fields';
import {
  PROSPECT_BANT_TIER_FIELD_KEY,
  PROSPECT_LEAD_SCORE_FIELD_KEY,
} from '@/lib/crm/prospects/prospect-bant-computed-fields.util';
import { CRM_PROSPECT_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import { getFieldsForLiveCreateForm } from '@/lib/forms/layout-canvas-fields.utils';
import { getFieldStringValidationError } from '@/lib/forms/field-string-validation.utils';
import {
  getProspectValidationFields,
  type ProspectValidationFieldMode,
} from '@/lib/crm/prospects/prospect-validation-fields.util';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import {
  isEmptyLocationValue,
  isLocationValue,
} from '@/lib/crm/location/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFieldStringValue(
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

function isProspectStringValidationField(
  field: ProspectFieldDefinition,
): boolean {
  return (
    field.type === 'text' ||
    field.type === 'textarea' ||
    field.type === 'phone'
  );
}

function isSelectOptionAllowed(
  field: ProspectFieldDefinition,
  value: string,
): boolean {
  return field.options?.some((option) => option.value === value) ?? false;
}

function validateProspectFieldValue(
  field: ProspectFieldDefinition,
  values: Record<string, FieldStoredValue>,
): string | null {
  if (isSectionFieldType(field.type)) {
    return null;
  }

  if (field.type === 'location') {
    const raw = values[field.key];
    const locationValue = isLocationValue(raw) ? raw : null;
    if (field.required && (!locationValue || isEmptyLocationValue(locationValue))) {
      return `${field.label} is required`;
    }
    return null;
  }

  if (field.type === 'multiselect') {
    const raw = values[field.key];
    const items = Array.isArray(raw)
      ? raw.map((item) => String(item).trim()).filter(Boolean)
      : [];

    if (field.required && items.length === 0) {
      return `${field.label} is required`;
    }

    for (const item of items) {
      if (!isSelectOptionAllowed(field, item)) {
        return `Invalid value for ${field.label}`;
      }
    }

    return null;
  }

  if (field.type === 'select') {
    const stringValue = getFieldStringValue(values, field.key).trim();
    if (field.required && !stringValue) {
      return `${field.label} is required`;
    }
    if (stringValue && !isSelectOptionAllowed(field, stringValue)) {
      return `Invalid value for ${field.label}`;
    }
    return null;
  }

  if (field.type === 'number') {
    const raw = values[field.key];
    const stringValue = getFieldStringValue(values, field.key).trim();
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
    const stringValue = getFieldStringValue(values, field.key).trim();
    if (field.required && !stringValue) {
      return `${field.label} is required`;
    }
    if (stringValue && Number.isNaN(Date.parse(stringValue))) {
      return `${field.label} must be a valid date`;
    }
    return null;
  }

  const stringValue = getFieldStringValue(values, field.key).trim();

  if (field.required && !stringValue) {
    return `${field.label} is required`;
  }

  if (field.type === 'email' && stringValue) {
    if (!EMAIL_PATTERN.test(stringValue)) {
      return `${field.label} must be a valid email`;
    }
  }

  if (isProspectStringValidationField(field) && stringValue) {
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

export function validateProspectFormValues(
  fields: ProspectFieldDefinition[],
  values: Record<string, FieldStoredValue>,
  options?: {
    applyLeadTypeRules?: boolean;
    mode?: ProspectValidationFieldMode;
    layoutFields?: ProspectFieldDefinition[];
    formKey?: string;
  },
): string | null {
  const applicableFields = options?.applyLeadTypeRules
    ? getProspectValidationFields(fields, values, {
        mode: options.mode ?? 'full',
        formKey: options.formKey,
        layoutFields: options.layoutFields ?? fields,
      })
    : fields;

  for (const field of applicableFields) {
    const error = validateProspectFieldValue(field, values);
    if (error) {
      return error;
    }
  }

  return null;
}

/** Same non-section fields as the Add Prospect form (+ org fields on that form). */
export function getProspectTableFields(
  fields: ProspectFieldDefinition[],
): ProspectFieldDefinition[] {
  const formFields = getFieldsForLiveCreateForm(
    CRM_PROSPECT_CREATE_FORM_KEY,
    fields,
  ).filter(
    (field) => !isSectionFieldType(field.type),
  ) as ProspectFieldDefinition[];

  const formKeys = new Set(formFields.map((field) => field.key));
  const scoreField = fields.find(
    (field) =>
      field.key === PROSPECT_LEAD_SCORE_FIELD_KEY &&
      !isSectionFieldType(field.type),
  );

  if (!scoreField || formKeys.has(PROSPECT_LEAD_SCORE_FIELD_KEY)) {
    return formFields;
  }

  return [...formFields, scoreField].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
}

/** Default list column visibility for prospects (BANT tier merges into Lead Score). */
export function getProspectListTableDefaultColumnVisible(
  field: ProspectFieldDefinition,
  allFields: ProspectFieldDefinition[],
): boolean {
  if (
    field.key === PROSPECT_BANT_TIER_FIELD_KEY &&
    allFields.some((item) => item.key === PROSPECT_LEAD_SCORE_FIELD_KEY)
  ) {
    return false;
  }

  return getCrmListTableDefaultColumnVisible(field);
}

export { fieldSupportsFormStringValidation } from '@/lib/forms/field-string-validation.utils';
