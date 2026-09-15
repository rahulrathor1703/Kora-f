import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

const LEGACY_EDITABLE_ON_DETAIL_KEYS = new Set([
  'crmStatus',
  'followUpDue',
  'remarks',
]);

export type ProspectDetailFrom = 'prospectus' | 'pipeline';

function sortByOrder(fields: ProspectFieldDefinition[]): ProspectFieldDefinition[] {
  return [...fields].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function isEditableOnDetail(field: ProspectFieldDefinition): boolean {
  if (field.editableOnDetail !== undefined) {
    return field.editableOnDetail;
  }

  return LEGACY_EDITABLE_ON_DETAIL_KEYS.has(field.key);
}

export function getDetailReadOnlyFields(
  fields: ProspectFieldDefinition[],
): ProspectFieldDefinition[] {
  return sortByOrder(
    fields.filter(
      (field) => field.showInTable && !isEditableOnDetail(field),
    ),
  );
}

export function getDetailEditableFields(
  fields: ProspectFieldDefinition[],
): ProspectFieldDefinition[] {
  return sortByOrder(fields.filter((field) => isEditableOnDetail(field)));
}

export function getProspectDetailBackHref(from: ProspectDetailFrom | null): string {
  if (from === 'pipeline') {
    return '/crm/pipeline';
  }

  return '/crm/prospectus';
}

export function getProspectDetailBackLabel(from: ProspectDetailFrom | null): string {
  if (from === 'pipeline') {
    return 'Back to pipeline';
  }

  return 'Back to prospects';
}
