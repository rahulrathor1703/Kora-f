import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';

export const FORM_GRID_COLUMNS = 12;

export interface FormLayoutField {
  id: string;
  key: string;
  type: string;
  label: string;
  sectionId?: string;
  formColSpan?: number;
}

export type FormFieldGroup<T extends FormLayoutField> =
  | {
      kind: 'fields';
      id: string;
      fields: T[];
    }
  | {
      kind: 'section';
      id: string;
      title: string | null;
      fields: T[];
    };

const FULL_WIDTH_FIELD_TYPES = new Set([
  'textarea',
  'location',
  'company-category',
  'company-location',
]);

export function defaultFormColSpan(type: string): number {
  if (isSectionFieldType(type) || FULL_WIDTH_FIELD_TYPES.has(type)) {
    return FORM_GRID_COLUMNS;
  }

  return 6;
}

export function resolveFormColSpan(field: FormLayoutField): number {
  const span = field.formColSpan ?? defaultFormColSpan(field.type);
  return Math.min(FORM_GRID_COLUMNS, Math.max(1, span));
}

export function getFormFieldColSpanClassName(field: FormLayoutField): string {
  const span = resolveFormColSpan(field);
  const classMap: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  };

  return classMap[span] ?? 'col-span-12';
}

export function buildFormFieldGroups<T extends FormLayoutField>(
  fields: T[],
): FormFieldGroup<T>[] {
  const groups: FormFieldGroup<T>[] = [];
  let pendingRoot: T[] = [];
  const sectionIndex = new Map<string, number>();

  function flushRoot() {
    if (pendingRoot.length === 0) {
      return;
    }

    groups.push({
      kind: 'fields',
      id: `fields-${groups.length}`,
      fields: pendingRoot,
    });
    pendingRoot = [];
  }

  function appendToSection(sectionId: string, field: T) {
    flushRoot();

    const existingIndex = sectionIndex.get(sectionId);
    if (existingIndex !== undefined) {
      groups[existingIndex].fields.push(field);
      return;
    }

    groups.push({
      kind: 'section',
      id: sectionId,
      title: null,
      fields: [field],
    });
    sectionIndex.set(sectionId, groups.length - 1);
  }

  for (const field of fields) {
    if (isSectionFieldType(field.type)) {
      flushRoot();

      if (!sectionIndex.has(field.id)) {
        groups.push({
          kind: 'section',
          id: field.id,
          title: field.label,
          fields: [],
        });
        sectionIndex.set(field.id, groups.length - 1);
      }

      continue;
    }

    if (field.sectionId) {
      appendToSection(field.sectionId, field);
      continue;
    }

    pendingRoot.push(field);
  }

  flushRoot();

  return groups.filter((group) => group.fields.length > 0);
}

export function getFormFieldGridClassName(): string {
  return 'grid grid-cols-12 gap-3 sm:gap-x-4 sm:gap-y-3';
}

export function snapFormColSpan(rawSpan: number): number {
  return Math.min(
    FORM_GRID_COLUMNS,
    Math.max(1, Math.round(rawSpan)),
  );
}

export function formColSpanFromPointerDelta(
  startSpan: number,
  deltaX: number,
  columnWidth: number,
): number {
  if (columnWidth <= 0) {
    return startSpan;
  }

  const spanDelta = Math.round(deltaX / columnWidth);
  return snapFormColSpan(startSpan + spanDelta);
}
