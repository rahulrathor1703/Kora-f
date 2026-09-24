'use client';

import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ColumnSettingsDialog, {
  ColumnSettingsButton,
} from './ColumnSettingsDialog';
import DataTableEmptyState from './DataTableEmptyState';
import DataTableActionsToolbar from './DataTableActionsToolbar';
import DataTablePagination from './DataTablePagination';
import DataTableSkeleton from './DataTableSkeleton';
import DataTableToolbar from './DataTableToolbar';
import {
  DataTableFieldFiltersSection,
  DataTableFilterButton,
} from './DataTableFilterPanel';
import { dataTableClassNames, dataTableSx } from './dataTableStyles';
import {
  buildFilterValueOptionsFromRows,
  filterTableRows,
  getActiveFieldFilters,
  isFieldFilterActive,
  type FieldFilter,
} from './filterTableRows';
import { formatCellValue } from './formatCellValue';
import {
  clampPage,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  paginateRows,
} from './paginateRows';
import type { DataTableProps } from './types';
import { useTableColumns } from './useTableColumns';

export default function DataTable<T extends object>({
  tableId,
  rows,
  getRowId,
  excludeFields = [],
  columnOverrides,
  isLoading = false,
  emptyMessage = 'No rows to display',
  noResultsMessage = 'No matching results. Try a different search term or field.',
  enableSearch = true,
  enableFieldFilters,
  searchPlaceholder = 'Search...',
  enablePagination = true,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onRowClick,
  rowActions,
  persistPreferences = true,
  includeFields = [],
  hideToolbar = false,
  onExternalToolbarChange,
  toolbarLeadingContent,
  filterValueOptions,
  rowSelection,
}: DataTableProps<T>) {
  const fieldFiltersEnabled = enableFieldFilters ?? enableSearch;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSession, setSettingsSession] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSession, setFilterSession] = useState(0);
  const [fieldFilters, setFieldFilters] = useState<FieldFilter[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const {
    visibleColumns,
    allColumns,
    searchableFields,
    isLoading: isPreferencesLoading,
    hasUserOverride,
    saveUserPreferences,
    saveTeamDefaults,
    resetUserPreferences,
    isSaving,
    saveError,
  } = useTableColumns({
    tableName: tableId,
    rows,
    excludeFields,
    columnOverrides,
    persistPreferences,
    includeFields,
  });

  const columnOptions = useMemo(
    () =>
      allColumns.map((column) => ({
        field: column.field,
        label: column.label,
      })),
    [allColumns],
  );

  const filterColumnOptions = useMemo(
    () =>
      columnOptions.filter(
        (column) => columnOverrides?.[column.field]?.filterable !== false,
      ),
    [columnOptions, columnOverrides],
  );

  const resolvedFilterValueOptions = useMemo(() => {
    if (filterValueOptions) {
      return filterValueOptions;
    }

    if (!fieldFiltersEnabled || filterColumnOptions.length === 0) {
      return undefined;
    }

    return buildFilterValueOptionsFromRows(
      rows,
      filterColumnOptions.map((column) => column.field),
      columnOverrides,
    );
  }, [
    columnOverrides,
    fieldFiltersEnabled,
    filterColumnOptions,
    filterValueOptions,
    rows,
  ]);

  const filteredRows = useMemo(
    () =>
      enableSearch || fieldFiltersEnabled
        ? filterTableRows({
            rows,
            searchQuery: enableSearch ? searchQuery : '',
            searchableFields,
            fieldFilters: fieldFiltersEnabled ? fieldFilters : [],
            columnOverrides,
          })
        : rows,
    [
      columnOverrides,
      enableSearch,
      fieldFilters,
      fieldFiltersEnabled,
      rows,
      searchQuery,
      searchableFields,
    ],
  );

  function handleSearchQueryChange(query: string) {
    setSearchQuery(query);
    setPage(0);
  }

  function handleFilterApply(filters: FieldFilter[]) {
    setFieldFilters(filters);
    setPage(0);
  }

  const safePage = useMemo(
    () => clampPage(page, filteredRows.length, pageSize),
    [filteredRows.length, page, pageSize],
  );

  const paginatedRows = useMemo(
    () =>
      enablePagination
        ? paginateRows(filteredRows, safePage, pageSize)
        : filteredRows,
    [enablePagination, filteredRows, pageSize, safePage],
  );

  const showSkeleton = isLoading || isPreferencesLoading;
  const filterActive = isFieldFilterActive(fieldFilters);
  const showColumnSettings = persistPreferences;

  const openColumnSettings = useCallback(() => {
    setSettingsSession((current) => current + 1);
    setSettingsOpen(true);
  }, []);

  const toggleFieldFilters = useCallback(() => {
    setFilterOpen((current) => {
      if (!current) {
        setFilterSession((session) => session + 1);
      }
      return !current;
    });
  }, []);

  const activeFilterCount = getActiveFieldFilters(fieldFilters).length;

  const hiddenFieldFiltersSection =
    hideToolbar && fieldFiltersEnabled ? (
      <DataTableFieldFiltersSection
        filterOpen={filterOpen}
        filterColumns={filterColumnOptions}
        fieldFilters={fieldFilters}
        filterValueOptions={resolvedFilterValueOptions}
        onFilterApply={handleFilterApply}
        onFilterToggle={toggleFieldFilters}
        filterSession={filterSession}
      />
    ) : null;

  const columnSettingsButton = showColumnSettings ? (
    <ColumnSettingsButton
      active={settingsOpen}
      onClick={openColumnSettings}
    />
  ) : null;

  useEffect(() => {
    if (!hideToolbar || !onExternalToolbarChange) {
      return;
    }

    if (!showColumnSettings && !fieldFiltersEnabled) {
      onExternalToolbarChange(null);
      return;
    }

    onExternalToolbarChange({
      showColumnSettings,
      columnSettingsOpen: settingsOpen,
      openColumnSettings,
      showFieldFilters: fieldFiltersEnabled,
      filterActive,
      filterOpen,
      activeFilterCount,
      toggleFieldFilters,
    });
  }, [
    activeFilterCount,
    fieldFiltersEnabled,
    filterActive,
    filterOpen,
    hideToolbar,
    onExternalToolbarChange,
    openColumnSettings,
    settingsOpen,
    showColumnSettings,
    toggleFieldFilters,
  ]);

  useEffect(() => {
    return () => {
      onExternalToolbarChange?.(null);
    };
  }, [onExternalToolbarChange]);

  if (showSkeleton) {
    return <DataTableSkeleton />;
  }

  const showActionsToolbar =
    !hideToolbar &&
    !enableSearch &&
    (toolbarLeadingContent || showColumnSettings || fieldFiltersEnabled);

  const handleFilterToggle = toggleFieldFilters;

  const emptyBodyColSpan =
    visibleColumns.length +
    (rowSelection ? 1 : 0) +
    (rowActions ? 1 : 0);
  const isFilteredEmpty = filteredRows.length === 0;

  return (
    <>
      {!hideToolbar && enableSearch ? (
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchQueryChange}
          searchPlaceholder={searchPlaceholder}
          filterOpen={filterOpen}
          filterActive={filterActive}
          onFilterToggle={handleFilterToggle}
          filterColumns={filterColumnOptions}
          fieldFilters={fieldFilters}
          filterValueOptions={resolvedFilterValueOptions}
          onFilterApply={handleFilterApply}
          filterSession={filterSession}
          toolbarActions={columnSettingsButton}
          leadingContent={toolbarLeadingContent}
        />
      ) : showActionsToolbar ? (
        <DataTableActionsToolbar
          leadingContent={toolbarLeadingContent}
          toolbarActions={
            <>
              {fieldFiltersEnabled ? (
                <DataTableFilterButton
                  active={filterActive}
                  open={filterOpen}
                  activeFilterCount={activeFilterCount}
                  onClick={handleFilterToggle}
                />
              ) : null}
              {columnSettingsButton}
            </>
          }
        />
      ) : null}

      {hiddenFieldFiltersSection}

      {visibleColumns.length === 0 ? (
        <DataTableEmptyState
          icon={<InboxOutlinedIcon />}
          title={emptyMessage}
          description="There is nothing to display in this table yet."
        />
      ) : (
        <>
          <TableContainer className={dataTableClassNames.scrollContainer}>
            <Table>
              <TableHead className={dataTableClassNames.headSticky}>
                <TableRow>
                  {rowSelection ? (
                    <TableCell
                      sx={dataTableSx.headCell}
                      className="w-12"
                      padding="checkbox"
                    >
                      <Checkbox
                        size="small"
                        checked={rowSelection.headerCheckbox.checked}
                        indeterminate={rowSelection.headerCheckbox.indeterminate}
                        onChange={rowSelection.headerCheckbox.onChange}
                        slotProps={{
                          input: { 'aria-label': 'Select all rows on this page' },
                        }}
                      />
                    </TableCell>
                  ) : null}
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.field}
                      align={column.align}
                      sx={dataTableSx.headCell}
                      className={
                        column.field === 'actions'
                          ? 'data-table-actions-sticky'
                          : undefined
                      }
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  {rowActions ? (
                    <TableCell align="right" sx={dataTableSx.actionsHeadCell}>
                      Actions
                    </TableCell>
                  ) : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {isFilteredEmpty ? (
                  <TableRow>
                    <TableCell
                      colSpan={emptyBodyColSpan}
                      sx={{ borderBottom: 0, p: 0 }}
                    >
                      <DataTableEmptyState
                        icon={
                          rows.length === 0 ? (
                            <InboxOutlinedIcon />
                          ) : (
                            <SearchOffOutlinedIcon />
                          )
                        }
                        title={
                          rows.length === 0
                            ? emptyMessage
                            : 'No matching results'
                        }
                        description={
                          rows.length === 0
                            ? 'There is nothing to display in this table yet.'
                            : noResultsMessage
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    hover={Boolean(onRowClick)}
                    className={
                      onRowClick
                        ? `cursor-pointer ${dataTableClassNames.rowHover}`
                        : dataTableClassNames.rowHover
                    }
                    onClick={
                      onRowClick
                        ? () => {
                            onRowClick(row);
                          }
                        : undefined
                    }
                  >
                    {rowSelection ? (
                      <TableCell
                        sx={dataTableSx.bodyCell}
                        padding="checkbox"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          size="small"
                          checked={rowSelection.selectedIds.has(getRowId(row))}
                          onChange={() =>
                            rowSelection.onToggleRow(getRowId(row))
                          }
                          slotProps={{
                            input: { 'aria-label': 'Select row' },
                          }}
                        />
                      </TableCell>
                    ) : null}
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align}
                        sx={dataTableSx.bodyCell}
                        className={
                          column.field === 'actions'
                            ? 'data-table-actions-sticky'
                            : undefined
                        }
                      >
                        {column.render
                          ? column.render(row)
                          : formatCellValue(
                              (row as Record<string, unknown>)[column.field],
                            )}
                      </TableCell>
                    ))}
                    {rowActions ? (
                      <TableCell
                        align="right"
                        sx={dataTableSx.actionsCell}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {rowActions(row)}
                      </TableCell>
                    ) : null}
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {enablePagination && !isFilteredEmpty ? (
            <DataTablePagination
              page={safePage}
              pageSize={pageSize}
              totalRows={filteredRows.length}
              pageSizeOptions={pageSizeOptions}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          ) : null}
        </>
      )}

      <ColumnSettingsDialog
        key={settingsSession}
        open={settingsOpen}
        tableName={tableId}
        initialColumns={allColumns}
        hasUserOverride={hasUserOverride}
        isSaving={isSaving}
        saveError={saveError}
        onClose={() => setSettingsOpen(false)}
        onSaveUserPreferences={async (columns) => {
          await saveUserPreferences(columns);
        }}
        onSaveTeamDefaults={async (columns) => {
          await saveTeamDefaults(columns);
        }}
        onResetUserPreferences={async () => {
          await resetUserPreferences();
        }}
      />
    </>
  );
}
