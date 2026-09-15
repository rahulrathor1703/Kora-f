import { resolveManualListColumnKeys } from '@/lib/lists/column-utils';
import type {
  CreateManualListInput,
  ProspectFieldMapping,
} from '@/lib/lists/types';
import type { ManualListBuilderFormValues } from '@/lib/schemas/manual-list';

const EMAIL_LABELS = new Set(['email', 'e mail', 'email address', 'mail']);
const NAME_LABELS = new Set(['name', 'full name', 'fullname', 'contact name']);
const FIRST_NAME_LABELS = new Set([
  'first name',
  'firstname',
  'given name',
]);
const LAST_NAME_LABELS = new Set([
  'last name',
  'lastname',
  'surname',
  'family name',
]);

export function buildManualListCreatePayload(
  values: ManualListBuilderFormValues,
  options?: {
    syncToProspects?: boolean;
    prospectFieldMapping?: ProspectFieldMapping;
  },
): CreateManualListInput {
  const resolvedColumns = resolveManualListColumnKeys(
    values.columns.map((column) => column.label),
  ).filter((column) => column.key);

  const columnKeys = new Set(resolvedColumns.map((column) => column.key));

  return {
    name: values.name.trim(),
    columns: resolvedColumns.map((column) => ({ label: column.label })),
    rows: values.rows
      .map((row) => {
        const valuesByKey: Record<string, string> = {};

        for (const key of columnKeys) {
          const value = (row.values[key] ?? '').trim();
          if (value) {
            valuesByKey[key] = value;
          }
        }

        return { values: valuesByKey };
      })
      .filter((row) => Object.keys(row.values).length > 0),
    syncToProspects: options?.syncToProspects,
    prospectFieldMapping: options?.prospectFieldMapping,
  };
}

export function detectManualListProspectFieldMapping(
  columns: Array<{ label: string; key?: string }>,
): ProspectFieldMapping | null {
  let emailColumnKey: string | null = null;
  let nameColumnKey: string | undefined;

  for (const column of columns) {
    const resolved = resolveManualListColumnKeys([column.label])[0];
    const key = column.key ?? resolved?.key;
    if (!key) {
      continue;
    }

    const normalized = normalizeColumnLabel(column.label, key);

    if (!emailColumnKey && EMAIL_LABELS.has(normalized)) {
      emailColumnKey = key;
    }

    if (!nameColumnKey && NAME_LABELS.has(normalized)) {
      nameColumnKey = key;
    }
  }

  if (!emailColumnKey) {
    return null;
  }

  return { emailColumnKey, nameColumnKey };
}

function normalizeColumnLabel(label: string, key: string): string {
  return (label.trim() || key.trim()).toLowerCase().replace(/[\s_-]+/g, ' ');
}

export function mapProspectToManualListRow(
  prospect: { email: string; fullName: string },
  columns: Array<{ label: string; key: string }>,
): Record<string, string> {
  const nameParts = prospect.fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ');

  return Object.fromEntries(
    columns.map((column) => {
      const normalized = normalizeColumnLabel(column.label, column.key);

      if (EMAIL_LABELS.has(normalized)) {
        return [column.key, prospect.email];
      }

      if (NAME_LABELS.has(normalized)) {
        return [column.key, prospect.fullName];
      }

      if (FIRST_NAME_LABELS.has(normalized)) {
        return [column.key, firstName];
      }

      if (LAST_NAME_LABELS.has(normalized)) {
        return [column.key, lastName];
      }

      return [column.key, ''];
    }),
  );
}

export function formatProspectSyncMessage(
  prospectSync?: {
    created: number;
    skipped: number;
  },
): string | null {
  if (!prospectSync) {
    return null;
  }

  const parts = [`${prospectSync.created} added to CRM`];
  if (prospectSync.skipped > 0) {
    parts.push(`${prospectSync.skipped} skipped`);
  }

  return parts.join(' · ');
}
