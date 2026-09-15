'use client';

import { useMemo } from 'react';
import { inferColumnsFromRows } from './inferColumns';
import { mergeColumnPrefs } from './mergeColumnPrefs';
import type { ColumnOverride, ResolvedColumn } from './types';
import { useTablePreferences } from './useTablePreferences';

interface UseTableColumnsOptions<T extends object> {
  tableName: string;
  rows: T[];
  excludeFields?: string[];
  columnOverrides?: Partial<Record<string, ColumnOverride<T>>>;
  persistPreferences?: boolean;
  includeFields?: string[];
}

interface UseTableColumnsResult<T extends object> {
  columns: ResolvedColumn<T>[];
  allColumns: ResolvedColumn<T>[];
  visibleColumns: ResolvedColumn<T>[];
  searchableFields: string[];
  isLoading: boolean;
  error: string | null;
  hasUserOverride: boolean;
  hasTeamDefault: boolean;
  saveUserPreferences: ReturnType<
    typeof useTablePreferences
  >['saveUserPreferences'];
  saveTeamDefaults: ReturnType<
    typeof useTablePreferences
  >['saveTeamDefaults'];
  resetUserPreferences: ReturnType<
    typeof useTablePreferences
  >['resetUserPreferences'];
  isSaving: boolean;
  saveError: string | null;
}

export function useTableColumns<T extends object>({
  tableName,
  rows,
  excludeFields = [],
  columnOverrides,
  persistPreferences = true,
  includeFields = [],
}: UseTableColumnsOptions<T>): UseTableColumnsResult<T> {
  const {
    savedColumns,
    hasUserOverride,
    hasTeamDefault,
    isLoading,
    error,
    saveUserPreferences,
    saveTeamDefaults,
    resetUserPreferences,
    isSaving,
    saveError,
  } = useTablePreferences(tableName, persistPreferences);

  const inferredFields = useMemo(() => {
    const excluded = new Set(excludeFields);
    const fromRows = inferColumnsFromRows(rows, excludeFields);
    const seen = new Set<string>();
    const merged: string[] = [];

    for (const field of includeFields) {
      if (excluded.has(field) || seen.has(field)) {
        continue;
      }

      seen.add(field);
      merged.push(field);
    }

    for (const field of fromRows) {
      if (seen.has(field)) {
        continue;
      }

      seen.add(field);
      merged.push(field);
    }

    return merged;
  }, [excludeFields, includeFields, rows]);

  const allColumns = useMemo(
    () =>
      mergeColumnPrefs({
        inferredFields,
        savedColumns,
        columnOverrides,
      }),
    [columnOverrides, inferredFields, savedColumns],
  );

  const visibleColumns = useMemo(
    () => allColumns.filter((column) => column.visible),
    [allColumns],
  );

  const searchableFields = useMemo(
    () =>
      allColumns
        .filter((column) => columnOverrides?.[column.field]?.searchable !== false)
        .map((column) => column.field),
    [allColumns, columnOverrides],
  );

  return {
    columns: visibleColumns,
    allColumns,
    visibleColumns,
    searchableFields,
    isLoading,
    error,
    hasUserOverride,
    hasTeamDefault,
    saveUserPreferences,
    saveTeamDefaults,
    resetUserPreferences,
    isSaving,
    saveError,
  };
}
