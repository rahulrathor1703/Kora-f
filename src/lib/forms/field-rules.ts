import {
  fieldDeleteBlockedReason as crmFieldDeleteBlockedReason,
  isFieldKeyInUse,
} from '@/lib/crm/fields/field-delete-rules';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type { FormEditorMode, FormFieldDefinition } from '@/lib/forms/types';

export function isPlatformLockedField(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  return mode === 'org' && field.source === 'platform';
}

export function isFormFieldDraggable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (mode === 'platform') {
    return true;
  }

  return field.source === 'org';
}

export function isFormFieldResizable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  return isFormFieldDraggable(field, mode);
}

export function isFormFieldDeletable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
  fieldKeysInUse: string[] | undefined,
  allFields: FormFieldDefinition[],
): boolean {
  if (isPlatformLockedField(field, mode)) {
    return false;
  }

  if (mode === 'platform') {
    if (isSectionFieldType(field.type)) {
      const children = allFields.filter((item) => item.sectionId === field.id);
      for (const child of children) {
        if (isFieldKeyInUse(child.key, fieldKeysInUse)) {
          return false;
        }
      }
      return true;
    }

    return !isFieldKeyInUse(field.key, fieldKeysInUse);
  }

  if (field.system || field.pipelineStage) {
    return false;
  }

  if (isSectionFieldType(field.type)) {
    const children = allFields.filter((item) => item.sectionId === field.id);
    for (const child of children) {
      if (isFieldKeyInUse(child.key, fieldKeysInUse)) {
        return false;
      }
    }
    return true;
  }

  return !isFieldKeyInUse(field.key, fieldKeysInUse);
}

export function formFieldDeleteBlockedReason(
  field: FormFieldDefinition,
  mode: FormEditorMode,
  fieldKeysInUse: string[] | undefined,
  allFields: FormFieldDefinition[],
): string | null {
  if (isPlatformLockedField(field, mode)) {
    return 'Platform field — cannot remove in organization mode';
  }

  if (mode === 'platform') {
    if (isSectionFieldType(field.type)) {
      const children = allFields.filter((item) => item.sectionId === field.id);
      for (const child of children) {
        if (isFieldKeyInUse(child.key, fieldKeysInUse)) {
          return 'Existing records use fields in this section';
        }
      }
      return null;
    }

    if (isFieldKeyInUse(field.key, fieldKeysInUse)) {
      return 'Existing records use this field';
    }

    return null;
  }

  return crmFieldDeleteBlockedReason(field, fieldKeysInUse, allFields);
}

export function isFormFieldPropertiesEditable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (mode === 'platform') {
    return true;
  }

  return !isPlatformLockedField(field, mode);
}
