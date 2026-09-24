import type { FormFieldDefinition } from '@/lib/forms/types';

export function slugifySectionKey(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

  if (!slug) {
    return 'section';
  }

  return slug.startsWith('section_') ? slug : `section_${slug}`;
}

export function isSectionFieldType(type: string): boolean {
  return type === 'section';
}

export function createSectionFieldDefinition(
  sortOrder: number,
  label = '',
  editableOnDetail = false,
): FormFieldDefinition {
  const id = crypto.randomUUID();
  const trimmedLabel = label.trim();
  const key = trimmedLabel
    ? slugifySectionKey(trimmedLabel)
    : `section_${id.replace(/-/g, '').slice(0, 12)}`;

  return {
    id,
    key,
    label: trimmedLabel,
    type: 'section',
    sortOrder,
    showInTable: false,
    showInForm: true,
    filterable: false,
    required: false,
    editableOnDetail,
  };
}

export function findSectionInsertIndex<
  T extends { id: string; type: string; sectionId?: string },
>(fields: T[], sectionId: string): number {
  const sectionIndex = fields.findIndex((field) => field.id === sectionId);
  if (sectionIndex < 0) {
    return fields.length;
  }

  let insertAt = sectionIndex + 1;

  for (let index = sectionIndex + 1; index < fields.length; index += 1) {
    if (fields[index].sectionId === sectionId) {
      insertAt = index + 1;
      continue;
    }

    if (fields[index].type === 'section') {
      break;
    }

    if (!fields[index].sectionId) {
      break;
    }
  }

  return insertAt;
}

export function insertFieldInSchema<
  T extends { id: string; type: string; sectionId?: string; sortOrder: number },
>(fields: T[], newField: T): T[] {
  const insertIndex = newField.sectionId
    ? findSectionInsertIndex(fields, newField.sectionId)
    : fields.length;
  const next = [
    ...fields.slice(0, insertIndex),
    newField,
    ...fields.slice(insertIndex),
  ];

  return next.map((field, sortOrder) => ({ ...field, sortOrder }));
}

export function findNestedSectionInsertIndex<
  T extends {
    id: string;
    type: string;
    sectionId?: string;
    sectionTier?: 'main' | 'sub';
    sortOrder: number;
  },
>(fields: T[], parentSectionId: string): number {
  const sorted = [...fields].sort((left, right) => left.sortOrder - right.sortOrder);
  const parentIndex = sorted.findIndex((field) => field.id === parentSectionId);
  if (parentIndex < 0) {
    return fields.length;
  }

  const containerIds = new Set<string>([parentSectionId]);
  let insertAt = parentIndex + 1;

  for (let index = parentIndex + 1; index < sorted.length; index += 1) {
    const field = sorted[index];

    if (field.type === 'section' && (field.sectionTier ?? 'main') === 'main') {
      if (!field.sectionId || !containerIds.has(field.sectionId)) {
        break;
      }
    }

    if (
      field.type === 'section' &&
      field.sectionTier === 'sub' &&
      field.sectionId &&
      containerIds.has(field.sectionId)
    ) {
      containerIds.add(field.id);
      insertAt = index + 1;
      continue;
    }

    if (field.sectionId && containerIds.has(field.sectionId)) {
      insertAt = index + 1;
      continue;
    }

    if (field.type === 'section' && field.sectionTier === 'sub' && !field.sectionId) {
      insertAt = index + 1;
      continue;
    }

    break;
  }

  return insertAt;
}

export function findSubSectionInsertIndex<
  T extends { id: string; type: string; sectionTier?: 'main' | 'sub' },
>(fields: T[], mainSectionId: string): number {
  const mainIndex = fields.findIndex((field) => field.id === mainSectionId);
  if (mainIndex < 0) {
    return fields.length;
  }

  let insertAt = mainIndex + 1;

  for (let index = mainIndex + 1; index < fields.length; index += 1) {
    const field = fields[index];
    if (field.type === 'section' && (field.sectionTier ?? 'main') === 'main') {
      break;
    }

    if (field.type === 'section' && field.sectionTier === 'sub') {
      insertAt = index + 1;
      continue;
    }

    break;
  }

  return insertAt;
}

export function collectDescendantSectionIds<
  T extends { id: string; type: string; sectionId?: string; sectionTier?: 'main' | 'sub' },
>(fields: T[], rootSectionId: string): Set<string> {
  const ids = new Set<string>([rootSectionId]);
  let expanded = true;

  while (expanded) {
    expanded = false;
    for (const field of fields) {
      if (!isSectionFieldType(field.type)) {
        continue;
      }

      if (field.sectionId && ids.has(field.sectionId) && !ids.has(field.id)) {
        ids.add(field.id);
        expanded = true;
      }
    }
  }

  return ids;
}

export function findParentMainSectionId<
  T extends { id: string; type: string; sectionTier?: 'main' | 'sub'; sortOrder: number },
>(fields: T[], subSectionId: string): string | null {
  const sorted = [...fields].sort((left, right) => left.sortOrder - right.sortOrder);
  const subIndex = sorted.findIndex((field) => field.id === subSectionId);
  if (subIndex < 0) {
    return null;
  }

  for (let index = subIndex - 1; index >= 0; index -= 1) {
    const field = sorted[index];
    if (field.type === 'section' && (field.sectionTier ?? 'main') === 'main') {
      return field.id;
    }
  }

  return null;
}

export function insertSectionFieldInSchema<
  T extends { id: string; type: string; sectionId?: string; sortOrder: number },
>(fields: T[], newSection: T, insertIndex: number): T[] {
  const next = [
    ...fields.slice(0, insertIndex),
    newSection,
    ...fields.slice(insertIndex),
  ];

  return next.map((field, sortOrder) => ({ ...field, sortOrder }));
}

export type SectionBlockRange = { start: number; end: number };

export type LayoutSectionMoveDirection = 'up' | 'down';

type SortableSectionField = {
  id: string;
  type: string;
  sectionId?: string;
  sectionTier?: 'main' | 'sub';
  sortOrder: number;
};

function sortFieldsByOrder<T extends { sortOrder: number }>(fields: T[]): T[] {
  return [...fields].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function isMainSectionField(field: {
  type: string;
  sectionTier?: 'main' | 'sub';
}): boolean {
  return isSectionFieldType(field.type) && (field.sectionTier ?? 'main') === 'main';
}

export function isSubSectionField(field: {
  type: string;
  sectionTier?: 'main' | 'sub';
}): boolean {
  return isSectionFieldType(field.type) && field.sectionTier === 'sub';
}

function resolveSubSectionParentId<T extends SortableSectionField>(
  sorted: T[],
  subSectionId: string,
): string | null {
  const subIndex = sorted.findIndex((field) => field.id === subSectionId);
  if (subIndex < 0) {
    return null;
  }

  const subField = sorted[subIndex];
  if (!isSubSectionField(subField)) {
    return null;
  }

  if (subField.sectionId) {
    return subField.sectionId;
  }

  return findParentMainSectionId(sorted, subSectionId);
}

function isDirectChildSubSection<T extends SortableSectionField>(
  sorted: T[],
  subField: T,
  parentSectionId: string,
): boolean {
  if (!isSubSectionField(subField)) {
    return false;
  }

  if (subField.sectionId) {
    return subField.sectionId === parentSectionId;
  }

  return findParentMainSectionId(sorted, subField.id) === parentSectionId;
}

function getSectionContainerRange<T extends SortableSectionField>(
  fields: T[],
  containerSectionId: string,
): SectionBlockRange | null {
  const sorted = sortFieldsByOrder(fields);
  const field = sorted.find((item) => item.id === containerSectionId);
  if (!field || !isSectionFieldType(field.type)) {
    return null;
  }

  if (isMainSectionField(field)) {
    return getMainSectionBlockRange(fields, containerSectionId);
  }

  return getSubSectionBlockRange(fields, containerSectionId);
}

export function getMainSectionBlockRange<T extends SortableSectionField>(
  fields: T[],
  mainSectionId: string,
): SectionBlockRange | null {
  const sorted = sortFieldsByOrder(fields);
  const start = sorted.findIndex((field) => field.id === mainSectionId);
  if (start < 0 || !isMainSectionField(sorted[start])) {
    return null;
  }

  let end = sorted.length;
  for (let index = start + 1; index < sorted.length; index += 1) {
    if (isMainSectionField(sorted[index])) {
      end = index;
      break;
    }
  }

  return { start, end };
}

export function getSubSectionBlockRange<T extends SortableSectionField>(
  fields: T[],
  subSectionId: string,
): SectionBlockRange | null {
  const sorted = sortFieldsByOrder(fields);
  const start = sorted.findIndex((field) => field.id === subSectionId);
  if (start < 0 || !isSubSectionField(sorted[start])) {
    return null;
  }

  const parentId = resolveSubSectionParentId(sorted, subSectionId);
  if (!parentId) {
    return null;
  }

  const container = getSectionContainerRange(fields, parentId);
  if (!container) {
    return null;
  }

  let end = container.end;
  for (let index = start + 1; index < container.end; index += 1) {
    const field = sorted[index];
    if (isDirectChildSubSection(sorted, field, parentId)) {
      end = index;
      break;
    }
  }

  return { start, end };
}

export function listMainSectionIds<T extends SortableSectionField>(
  fields: T[],
): string[] {
  return sortFieldsByOrder(fields)
    .filter(isMainSectionField)
    .map((field) => field.id);
}

export function listSiblingSubSectionIds<T extends SortableSectionField>(
  fields: T[],
  parentSectionId: string,
): string[] {
  const container = getSectionContainerRange(fields, parentSectionId);
  if (!container) {
    return [];
  }

  const sorted = sortFieldsByOrder(fields);
  const ids: string[] = [];

  for (let index = container.start + 1; index < container.end; index += 1) {
    const field = sorted[index];
    if (isDirectChildSubSection(sorted, field, parentSectionId)) {
      ids.push(field.id);
    }
  }

  return ids;
}

function swapSectionBlocks<T extends SortableSectionField>(
  sorted: T[],
  upperRange: SectionBlockRange,
  lowerRange: SectionBlockRange,
): T[] {
  const [first, second] =
    upperRange.start < lowerRange.start
      ? [upperRange, lowerRange]
      : [lowerRange, upperRange];

  const before = sorted.slice(0, first.start);
  const blockFirst = sorted.slice(first.start, first.end);
  const middle = sorted.slice(first.end, second.start);
  const blockSecond = sorted.slice(second.start, second.end);
  const after = sorted.slice(second.end);

  return [...before, ...blockSecond, ...middle, ...blockFirst, ...after].map(
    (field, sortOrder) => ({ ...field, sortOrder }),
  );
}

export function moveLayoutSection<T extends SortableSectionField>(
  fields: T[],
  sectionId: string,
  direction: LayoutSectionMoveDirection,
): T[] {
  const sorted = sortFieldsByOrder(fields);
  const sectionField = sorted.find((field) => field.id === sectionId);
  if (!sectionField || !isSectionFieldType(sectionField.type)) {
    return fields;
  }

  const myRange = isMainSectionField(sectionField)
    ? getMainSectionBlockRange(fields, sectionId)
    : getSubSectionBlockRange(fields, sectionId);

  if (!myRange) {
    return fields;
  }

  const siblingIds = isMainSectionField(sectionField)
    ? listMainSectionIds(fields)
    : listSiblingSubSectionIds(
        fields,
        resolveSubSectionParentId(sorted, sectionId) ?? '',
      );

  const siblingIndex = siblingIds.indexOf(sectionId);
  if (siblingIndex < 0) {
    return fields;
  }

  const targetSiblingIndex =
    direction === 'up' ? siblingIndex - 1 : siblingIndex + 1;
  if (targetSiblingIndex < 0 || targetSiblingIndex >= siblingIds.length) {
    return fields;
  }

  const otherId = siblingIds[targetSiblingIndex];
  const otherField = sorted.find((field) => field.id === otherId);
  if (!otherField) {
    return fields;
  }

  const otherRange = isMainSectionField(otherField)
    ? getMainSectionBlockRange(fields, otherId)
    : getSubSectionBlockRange(fields, otherId);

  if (!otherRange) {
    return fields;
  }

  const upperRange =
    myRange.start < otherRange.start ? myRange : otherRange;
  const lowerRange =
    myRange.start < otherRange.start ? otherRange : myRange;

  if (direction === 'up') {
    if (myRange.start <= otherRange.start) {
      return fields;
    }

    return swapSectionBlocks(sorted, otherRange, myRange);
  }

  if (myRange.start >= otherRange.start) {
    return fields;
  }

  return swapSectionBlocks(sorted, upperRange, lowerRange);
}

export function getLayoutSectionMoveState<T extends SortableSectionField>(
  fields: T[],
  sectionId: string,
  reorderable: boolean,
): { canMoveUp: boolean; canMoveDown: boolean } {
  if (!reorderable) {
    return { canMoveUp: false, canMoveDown: false };
  }

  const sorted = sortFieldsByOrder(fields);
  const sectionField = sorted.find((field) => field.id === sectionId);
  if (!sectionField || !isSectionFieldType(sectionField.type)) {
    return { canMoveUp: false, canMoveDown: false };
  }

  const siblingIds = isMainSectionField(sectionField)
    ? listMainSectionIds(fields)
    : listSiblingSubSectionIds(
        fields,
        resolveSubSectionParentId(sorted, sectionId) ?? '',
      );

  const siblingIndex = siblingIds.indexOf(sectionId);
  if (siblingIndex < 0) {
    return { canMoveUp: false, canMoveDown: false };
  }

  return {
    canMoveUp: siblingIndex > 0,
    canMoveDown: siblingIndex < siblingIds.length - 1,
  };
}
