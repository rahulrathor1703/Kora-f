import { humanizeField } from './humanizeField';
import type { ColumnOverride, ResolvedColumn, StoredColumnPref } from './types';

interface MergeColumnPrefsOptions<T> {
  inferredFields: string[];
  savedColumns: StoredColumnPref[];
  columnOverrides?: Partial<Record<string, ColumnOverride<T>>>;
}

export function mergeColumnPrefs<T>({
  inferredFields,
  savedColumns,
  columnOverrides = {},
}: MergeColumnPrefsOptions<T>): ResolvedColumn<T>[] {
  const savedByField = new Map(
    savedColumns.map((column) => [column.field, column]),
  );
  const merged: ResolvedColumn<T>[] = [];

  for (const field of inferredFields) {
    const saved = savedByField.get(field);
    const override = columnOverrides[field];

    merged.push({
      field,
      label: override?.label ?? saved?.label ?? humanizeField(field),
      visible: saved?.visible ?? override?.defaultVisible ?? true,
      order: saved?.order ?? merged.length,
      align: override?.align ?? 'left',
      render: override?.render,
    });
  }

  return merged.sort((left, right) => left.order - right.order);
}

export function toStoredColumnPrefs<T>(
  columns: ResolvedColumn<T>[],
): StoredColumnPref[] {
  return columns.map((column, index) => ({
    field: column.field,
    label: column.label,
    visible: column.visible,
    order: index,
  }));
}
