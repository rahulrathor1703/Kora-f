import type { FormFieldDefinition, FormTableColumnDefinition } from '@/lib/forms/types';

function normalizeField(field: FormFieldDefinition) {
  return {
    id: field.id,
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required ?? false,
    sortOrder: field.sortOrder,
    showInTable: field.showInTable ?? false,
    showInForm: field.showInForm ?? true,
    filterable: field.filterable ?? false,
    formColSpan: field.formColSpan,
    sectionId: field.sectionId,
    options: field.options?.map((option) => ({
      value: option.value,
      label: option.label,
      color: option.color,
    })),
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
