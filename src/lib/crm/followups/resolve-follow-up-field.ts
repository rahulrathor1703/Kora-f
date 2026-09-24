import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

export const SYSTEM_FOLLOW_UP_FIELD_KEY = 'followUpDue';

export const LEGACY_FOLLOW_UP_FIELD_KEYS = ['follow_update'] as const;

function isFollowUpIntent(field: ProspectFieldDefinition): boolean {
  if (field.type !== 'date') {
    return false;
  }

  const haystack = `${field.key} ${field.label}`.toLowerCase();

  return (
    haystack.includes('follow') &&
    (haystack.includes('date') ||
      haystack.includes('due') ||
      haystack.includes('update'))
  );
}

export function resolveFollowUpFieldKey(
  fields: ProspectFieldDefinition[],
): string | null {
  const dateFields = fields.filter((field) => field.type === 'date');

  const systemField = dateFields.find(
    (field) => field.key === SYSTEM_FOLLOW_UP_FIELD_KEY,
  );
  if (systemField) {
    return systemField.key;
  }

  for (const legacyKey of LEGACY_FOLLOW_UP_FIELD_KEYS) {
    const legacyField = dateFields.find((field) => field.key === legacyKey);
    if (legacyField) {
      return legacyField.key;
    }
  }

  const heuristicField = dateFields.find(isFollowUpIntent);
  if (heuristicField) {
    return heuristicField.key;
  }

  return null;
}

export function getProspectFollowUpDate(
  prospectValues: Record<string, unknown>,
  followUpFieldKey: string,
): string {
  const rawValue = prospectValues[followUpFieldKey];
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return '';
  }

  return String(rawValue);
}
