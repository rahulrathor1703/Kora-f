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
