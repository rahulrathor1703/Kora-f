import { formatCellValue } from './formatCellValue';
import type { ColumnOverride } from './types';

export interface FieldFilter {
  field: string;
  value: string;
}

export interface FilterTableRowsOptions<T> {
  rows: T[];
  searchQuery: string;
  searchableFields: string[];
  fieldFilters?: FieldFilter[];
  columnOverrides?: Partial<Record<string, ColumnOverride<T>>>;
}

function getRowFieldDisplayText<T extends object>(
  row: T,
  field: string,
  columnOverrides?: Partial<Record<string, ColumnOverride<T>>>,
): string {
  const filterValue = columnOverrides?.[field]?.filterValue;
  if (filterValue) {
    return filterValue(row);
  }

  return formatCellValue((row as Record<string, unknown>)[field]);
}

function getSearchableText<T extends object>(
  row: T,
  field: string,
  columnOverrides?: Partial<Record<string, ColumnOverride<T>>>,
): string {
  return getRowFieldDisplayText(row, field, columnOverrides).toLowerCase();
}

function rowMatchesField<T extends object>(
  row: T,
  field: string,
  normalizedQuery: string,
  columnOverrides?: Partial<Record<string, ColumnOverride<T>>>,
): boolean {
  return getSearchableText(row, field, columnOverrides).includes(
    normalizedQuery,
  );
}

export function getActiveFieldFilters(
  fieldFilters: FieldFilter[] | null | undefined,
): FieldFilter[] {
  return (fieldFilters ?? []).filter(
    (filter) => filter.field && filter.value.trim(),
  );
}

export function filterTableRows<T extends object>({
  rows,
  searchQuery,
  searchableFields,
  fieldFilters = [],
  columnOverrides,
}: FilterTableRowsOptions<T>): T[] {
  let result = rows;

  const normalizedSearch = searchQuery.trim().toLowerCase();
  if (normalizedSearch) {
    result = result.filter((row) =>
      searchableFields.some((field) =>
        rowMatchesField(row, field, normalizedSearch, columnOverrides),
      ),
    );
  }

  const activeFilters = getActiveFieldFilters(fieldFilters);
  for (const filter of activeFilters) {
    const normalizedFilterValue = filter.value.trim().toLowerCase();
    result = result.filter((row) =>
      rowMatchesField(
        row,
        filter.field,
        normalizedFilterValue,
        columnOverrides,
      ),
    );
  }

  return result;
}

export function isFieldFilterActive(
  fieldFilters: FieldFilter[] | null | undefined,
): boolean {
  return getActiveFieldFilters(fieldFilters).length > 0;
}

export function buildFilterValueOptionsFromRows<T extends object>(
  rows: T[],
  fields: string[],
  columnOverrides?: Partial<Record<string, ColumnOverride<T>>>,
): Partial<Record<string, string[]>> {
  const options: Partial<Record<string, string[]>> = {};

  for (const field of fields) {
    const values = new Set<string>();

    for (const row of rows) {
      const formatted = getRowFieldDisplayText(row, field, columnOverrides);

      if (formatted && formatted !== '—') {
        values.add(formatted);
      }
    }

    options[field] = [...values].sort((left, right) =>
      left.localeCompare(right),
    );
  }

  return options;
}
