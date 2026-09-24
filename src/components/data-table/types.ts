import type { ReactNode } from 'react';

export interface StoredColumnPref {
  field: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface EffectiveTablePreferences {
  tableName: string;
  columns: StoredColumnPref[];
  hasUserOverride: boolean;
  hasTeamDefault: boolean;
}

export interface UpsertTablePreferencesInput {
  columns: StoredColumnPref[];
}

export type ColumnAlign = 'left' | 'center' | 'right';

export interface ColumnOverride<T> {
  label?: string;
  defaultVisible?: boolean;
  align?: ColumnAlign;
  render?: (row: T) => ReactNode;
  /** Plain-text value used for field filters and filter dropdown options. */
  filterValue?: (row: T) => string;
  searchable?: boolean;
  filterable?: boolean;
}

export interface ResolvedColumn<T> {
  field: string;
  label: string;
  visible: boolean;
  order: number;
  align: ColumnAlign;
  render?: (row: T) => ReactNode;
}

export interface DataTableRowSelection {
  selectedIds: ReadonlySet<string>;
  onToggleRow: (rowId: string) => void;
  headerCheckbox: {
    checked: boolean;
    indeterminate: boolean;
    onChange: () => void;
  };
}

export interface DataTableExternalToolbarState {
  showColumnSettings: boolean;
  columnSettingsOpen: boolean;
  openColumnSettings: () => void;
  showFieldFilters: boolean;
  filterActive: boolean;
  filterOpen: boolean;
  activeFilterCount: number;
  toggleFieldFilters: () => void;
}

export interface DataTableProps<T extends object> {
  tableId: string;
  rows: T[];
  getRowId: (row: T) => string;
  excludeFields?: string[];
  columnOverrides?: Partial<Record<string, ColumnOverride<T>>>;
  isLoading?: boolean;
  emptyMessage?: string;
  noResultsMessage?: string;
  enableSearch?: boolean;
  enableFieldFilters?: boolean;
  searchPlaceholder?: string;
  enablePagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => ReactNode;
  persistPreferences?: boolean;
  includeFields?: string[];
  hideToolbar?: boolean;
  onExternalToolbarChange?: (state: DataTableExternalToolbarState | null) => void;
  toolbarLeadingContent?: ReactNode;
  filterValueOptions?: Partial<Record<string, string[]>>;
  rowSelection?: DataTableRowSelection;
}
