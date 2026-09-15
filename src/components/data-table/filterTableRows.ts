import { formatCellValue } from './formatCellValue';

export interface FieldFilter {
  field: string;
  value: string;
}

export interface FilterTableRowsOptions<T> {
  rows: T[];
  searchQuery: string;
  searchableFields: string[];
  fieldFilters?: FieldFilter[];
}

function getSearchableText<T extends object>(row: T, field: string): string {
  return formatCellValue(
    (row as Record<string, unknown>)[field],
  ).toLowerCase();
}

function rowMatchesField<T extends object>(
  row: T,
  field: string,
  normalizedQuery: string,
): boolean {
  return getSearchableText(row, field).includes(normalizedQuery);
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
}: FilterTableRowsOptions<T>): T[] {
  let result = rows;

  const normalizedSearch = searchQuery.trim().toLowerCase();
  if (normalizedSearch) {
    result = result.filter((row) =>
      searchableFields.some((field) =>
        rowMatchesField(row, field, normalizedSearch),
      ),
    );
  }

  const activeFilters = getActiveFieldFilters(fieldFilters);
  for (const filter of activeFilters) {
    const normalizedFilterValue = filter.value.trim().toLowerCase();
    result = result.filter((row) =>
      rowMatchesField(row, filter.field, normalizedFilterValue),
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
): Partial<Record<string, string[]>> {
  const options: Partial<Record<string, string[]>> = {};

  for (const field of fields) {
    const values = new Set<string>();

    for (const row of rows) {
      const formatted = formatCellValue(
        (row as Record<string, unknown>)[field],
      );

      if (formatted) {
        values.add(formatted);
      }
    }

    options[field] = [...values].sort((left, right) =>
      left.localeCompare(right),
    );
  }

  return options;
}
