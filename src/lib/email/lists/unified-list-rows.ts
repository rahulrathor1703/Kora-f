import type { ContactList } from '@/lib/email/lists/types';
import type { ManualListSummary } from '@/lib/lists/types';

export type EmailListKind = 'imported' | 'manual';

export interface UnifiedEmailListRow extends Record<string, unknown> {
  id: string;
  name: string;
  listType: EmailListKind;
  entryCount: number;
  columnCount: number | null;
  createdAt: string;
}

export function formatEmailListKindLabel(listType: EmailListKind): string {
  return listType === 'imported' ? 'Imported' : 'Manual';
}

export function contactListToUnifiedRow(list: ContactList): UnifiedEmailListRow {
  return {
    id: list.id,
    name: list.name,
    listType: 'imported',
    entryCount: list.contactCount,
    columnCount: null,
    createdAt: list.createdAt,
  };
}

export function manualListToUnifiedRow(list: ManualListSummary): UnifiedEmailListRow {
  return {
    id: list.id,
    name: list.name,
    listType: 'manual',
    entryCount: list.rowCount,
    columnCount: list.columnCount,
    createdAt: list.createdAt,
  };
}

export function buildUnifiedEmailListRows(
  contactLists: ContactList[],
  manualLists: ManualListSummary[],
  includeManualLists: boolean,
): UnifiedEmailListRow[] {
  const rows = [
    ...contactLists.map(contactListToUnifiedRow),
    ...(includeManualLists ? manualLists.map(manualListToUnifiedRow) : []),
  ];

  return rows.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function getUnifiedEmailListDetailPath(
  row: UnifiedEmailListRow,
  toOrgPath: (path: string) => string,
): string {
  return row.listType === 'manual'
    ? toOrgPath(`/email/lists/manual/${row.id}`)
    : toOrgPath(`/email/lists/${row.id}`);
}
