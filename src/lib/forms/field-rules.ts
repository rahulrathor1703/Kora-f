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

export function orgPlatformFieldKeyConflictMessage(
  key: string,
  fields: FormFieldDefinition[],
  mode: FormEditorMode,
): string | null {
  if (mode !== 'org') {
    return null;
  }

  const trimmedKey = key.trim();
  const platformField = fields.find(
    (field) => field.source === 'platform' && field.key === trimmedKey,
  );

  if (!platformField) {
    return null;
  }

  return `Key "${trimmedKey}" is already used by the platform default "${platformField.label}". Use that field instead of creating a duplicate.`;
}

/** Field placed on a layout section/sub-section in the module editor canvas. */
export function isFormFieldOnLayoutCanvas(field: FormFieldDefinition): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  return Boolean(field.sectionId) && field.showInForm !== false;
}

function isLayoutInteractionBlockedField(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (mode === 'platform') {
    return false;
  }

  return Boolean(field.system || field.pipelineStage || field.layoutLocked);
}

/** User-controlled lock for org-created custom fields (not platform/system fields). */
export function isFormFieldUserLockable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  if (isPlatformLockedField(field, mode)) {
    return false;
  }

  if (field.system || field.pipelineStage) {
    return false;
  }

  if (mode === 'org') {
    return field.source !== 'platform';
  }

  return true;
}

export function isFormFieldLayoutDraggable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (isLayoutInteractionBlockedField(field, mode)) {
    return false;
  }

  if (isPlatformLockedField(field, mode)) {
    return false;
  }

  if (mode === 'platform') {
    return true;
  }

  return isFormFieldDraggable(field, mode);
}

export function isFormFieldDraggable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (mode === 'platform') {
    return true;
  }

  if (isSectionFieldType(field.type)) {
    return field.source === 'org';
  }

  return field.source === 'org';
}

export function isFormSectionReorderable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (!isSectionFieldType(field.type)) {
    return false;
  }

  return isFormFieldDraggable(field, mode);
}

export function canRemoveFieldFromLayoutCanvas(
  field: FormFieldDefinition,
  mode: FormEditorMode,
  fieldKeysInUse: string[] | undefined,
  allFields: FormFieldDefinition[],
): boolean {
  if (
    mode === 'platform' &&
    field.system &&
    isFormFieldOnLayoutCanvas(field)
  ) {
    return true;
  }

  if (isLayoutInteractionBlockedField(field, mode)) {
    return false;
  }

  if (mode === 'org' && isFormFieldOnLayoutCanvas(field)) {
    return !isPlatformLockedField(field, mode);
  }

  return isFormFieldDeletable(field, mode, fieldKeysInUse, allFields);
}

/** Org editor: hide field from layout and list it under Unused Fields (no hard delete). */
export function shouldMoveFieldToUnusedOnRemove(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  if (
    mode === 'platform' &&
    (field.system || field.pipelineStage) &&
    isFormFieldOnLayoutCanvas(field)
  ) {
    return true;
  }

  if (field.system || field.pipelineStage) {
    return false;
  }

  if (isPlatformLockedField(field, mode)) {
    return false;
  }

  return mode === 'org';
}

export function isFormFieldResizable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  return isFormFieldLayoutDraggable(field, mode);
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
  if (field.layoutLocked) {
    return 'Field is locked — unlock in field properties first';
  }

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

  if (field.layoutLocked) {
    return false;
  }

  return !isPlatformLockedField(field, mode);
}

function isOptionsFieldType(type: FormFieldDefinition['type']): boolean {
  return type === 'select' || type === 'multiselect';
}

export function isFormFieldOptionColorsEditable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (mode !== 'org' || !isPlatformLockedField(field, mode)) {
    return false;
  }

  if (!isOptionsFieldType(field.type)) {
    return false;
  }

  return field.displayOptionsAsChips === true;
}

export function isFormFieldOptionsFullyEditable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  if (!isOptionsFieldType(field.type)) {
    return false;
  }

  if (isFormFieldPropertiesEditable(field, mode)) {
    return true;
  }

  return Boolean(field.pipelineStage && mode === 'org');
}

export function isFormFieldOptionsEditable(
  field: FormFieldDefinition,
  mode: FormEditorMode,
): boolean {
  return (
    isFormFieldOptionsFullyEditable(field, mode) ||
    isFormFieldOptionColorsEditable(field, mode)
  );
}
