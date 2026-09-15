'use client';

import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
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

  const filteredRows = useMemo(
    () =>
      enableSearch || fieldFiltersEnabled
        ? filterTableRows({
            rows,
            searchQuery: enableSearch ? searchQuery : '',
            searchableFields,
            fieldFilters: fieldFiltersEnabled ? fieldFilters : [],
          })
        : rows,
    [
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
        filterValueOptions={filterValueOptions}
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

  if (rows.length === 0) {
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
            filterValueOptions={filterValueOptions}
            onFilterApply={handleFilterApply}
            filterSession={filterSession}
            toolbarActions={columnSettingsButton}
            leadingContent={toolbarLeadingContent}
          />
        ) : null}
        {showActionsToolbar ? (
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
        <DataTableEmptyState
          icon={<InboxOutlinedIcon />}
          title={emptyMessage}
          description="There is nothing to display in this table yet."
        />
      </>
    );
  }

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
          filterValueOptions={filterValueOptions}
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

      {filteredRows.length === 0 ? (
        <DataTableEmptyState
          icon={<SearchOffOutlinedIcon />}
          title="No matching results"
          description={noResultsMessage}
        />
      ) : (
        <>
          <TableContainer className={dataTableClassNames.scrollContainer}>
            <Table>
              <TableHead className={dataTableClassNames.headSticky}>
                <TableRow>
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
                {paginatedRows.map((row) => (
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {enablePagination ? (
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
