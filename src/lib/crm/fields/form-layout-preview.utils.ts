import type { FormLayoutField } from '@/lib/crm/fields/form-layout.utils';
import {
  findSectionInsertIndex,
  isSectionFieldType,
} from '@/lib/crm/fields/section-field.utils';
import { FORM_LAYOUT_CANVAS_APPEND_GROUP } from '@/lib/forms/form-layout-dnd';

interface SortableFormField extends FormLayoutField {
  sortOrder: number;
  showInForm: boolean;
}

export function getFormLayoutGroupKey(field: SortableFormField): string {
  return field.sectionId ?? 'root';
}

export function reorderFormLayoutGroup<T extends SortableFormField>(
  allFields: T[],
  groupKey: string,
  activeId: string,
  overId: string,
): T[] {
  if (activeId === overId) {
    return allFields;
  }

  const sorted = [...allFields].sort((left, right) => left.sortOrder - right.sortOrder);
  const groupIndices: number[] = [];

  sorted.forEach((field, index) => {
    if (isSectionFieldType(field.type) || !field.showInForm) {
      return;
    }

    if (getFormLayoutGroupKey(field) === groupKey) {
      groupIndices.push(index);
    }
  });

  const groupFields = groupIndices.map((index) => sorted[index]);
  const activeGroupIndex = groupFields.findIndex((field) => field.id === activeId);
  const overGroupIndex = groupFields.findIndex((field) => field.id === overId);

  if (activeGroupIndex < 0 || overGroupIndex < 0) {
    return allFields;
  }

  const nextGroupFields = [...groupFields];
  const [moved] = nextGroupFields.splice(activeGroupIndex, 1);
  nextGroupFields.splice(overGroupIndex, 0, moved);

  const nextSorted = [...sorted];
  groupIndices.forEach((originalIndex, groupIndex) => {
    nextSorted[originalIndex] = nextGroupFields[groupIndex];
  });

  return nextSorted.map((field, index) => ({
    ...field,
    sortOrder: index,
  }));
}

export function updateFieldFormColSpan<T extends SortableFormField>(
  allFields: T[],
  fieldId: string,
  formColSpan: number,
): T[] {
  return allFields.map((field) =>
    field.id === fieldId ? { ...field, formColSpan } : field,
  );
}

function findRootAppendIndex<T extends { type: string; sectionId?: string }>(
  fields: T[],
): number {
  for (let index = fields.length - 1; index >= 0; index -= 1) {
    const field = fields[index];
    if (isSectionFieldType(field.type)) {
      continue;
    }

    if (!field.sectionId) {
      return index + 1;
    }
  }

  const firstSectionIndex = fields.findIndex((field) =>
    isSectionFieldType(field.type),
  );

  if (firstSectionIndex >= 0) {
    return firstSectionIndex;
  }

  return fields.length;
}

export function moveFieldToLayoutGroup<T extends SortableFormField>(
  allFields: T[],
  fieldId: string,
  targetGroupKey: string,
  insertBeforeFieldId: string | null,
): T[] {
  const sorted = [...allFields].sort((left, right) => left.sortOrder - right.sortOrder);
  const fieldIndex = sorted.findIndex((field) => field.id === fieldId);

  if (fieldIndex < 0) {
    return allFields;
  }

  const [movedField] = sorted.splice(fieldIndex, 1);
  const targetSectionId =
    targetGroupKey === 'root' || targetGroupKey === FORM_LAYOUT_CANVAS_APPEND_GROUP
      ? undefined
      : targetGroupKey;

  const nextField: T = {
    ...movedField,
    sectionId: targetSectionId,
    showInForm: true,
  };

  let insertIndex = sorted.length;

  if (insertBeforeFieldId) {
    const beforeIndex = sorted.findIndex((field) => field.id === insertBeforeFieldId);
    if (beforeIndex >= 0) {
      insertIndex = beforeIndex;
    }
  } else if (targetGroupKey === FORM_LAYOUT_CANVAS_APPEND_GROUP) {
    insertIndex = sorted.length;
  } else if (targetGroupKey === 'root') {
    insertIndex = findRootAppendIndex(sorted);
  } else {
    insertIndex = findSectionInsertIndex(sorted, targetGroupKey);
  }

  const nextSorted = [
    ...sorted.slice(0, insertIndex),
    nextField,
    ...sorted.slice(insertIndex),
  ];

  return nextSorted.map((field, index) => ({
    ...field,
    sortOrder: index,
  }));
}
