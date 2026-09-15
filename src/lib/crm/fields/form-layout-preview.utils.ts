import type { FormLayoutField } from '@/lib/crm/fields/form-layout.utils';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';

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
