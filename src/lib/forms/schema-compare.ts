import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type { FormFieldDefinition, FormTableColumnDefinition } from '@/lib/forms/types';

function normalizeField(field: FormFieldDefinition) {
  return {
    id: field.id,
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required ?? false,
    minLength: field.minLength ?? null,
    maxLength: field.maxLength ?? null,
    validationType: field.validationType ?? null,
    sortOrder: field.sortOrder,
    showInTable: isSectionFieldType(field.type)
      ? false
      : (field.showInTable ?? true),
    showInForm: field.showInForm ?? true,
    filterable: field.filterable ?? false,
    formColSpan: field.formColSpan ?? null,
    sectionId: field.sectionId ?? null,
    placeholder: field.placeholder?.trim() ?? null,
    helpText: field.helpText?.trim() ?? null,
    displayOptionsAsChips: field.displayOptionsAsChips ?? false,
    editableOnDetail: field.editableOnDetail ?? null,
    sectionTier: field.sectionTier ?? null,
    options: field.options?.map((option) => ({
      value: option.value,
      label: option.label,
      color: option.color,
    })),
    locationComponents: field.locationComponents ?? null,
    locationInputMode: field.locationInputMode ?? null,
  };
}

export function areFormSchemasEqual(
  left: FormFieldDefinition[],
  right: FormFieldDefinition[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const normalizedLeft = left.map(normalizeField);
  const normalizedRight = right.map(normalizeField);

  return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
}

function normalizeTableColumn(column: FormTableColumnDefinition) {
  return {
    id: column.id,
    key: column.key,
    label: column.label,
    type: column.type,
    required: column.required,
    sortOrder: column.sortOrder,
    system: column.system ?? false,
  };
}

export function areTableColumnsEqual(
  left: FormTableColumnDefinition[],
  right: FormTableColumnDefinition[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const normalizedLeft = left.map(normalizeTableColumn);
  const normalizedRight = right.map(normalizeTableColumn);

  return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
}
