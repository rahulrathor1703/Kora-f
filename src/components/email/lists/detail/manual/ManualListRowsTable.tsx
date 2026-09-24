'use client';

import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { ReactNode } from 'react';
import DataTable from '@/components/data-table/DataTable';
import type { ManualListColumn, ManualListRow } from '@/lib/lists/types';

interface ManualListRowTableItem extends Record<string, unknown> {
  id: string;
}

function flattenRow(
  row: ManualListRow,
  columns: ManualListColumn[],
): ManualListRowTableItem {
  const item: ManualListRowTableItem = { id: row.id };

  for (const column of columns) {
    item[column.key] = row.values[column.key] ?? '';
  }

  return item;
}

interface ManualListRowsTableProps {
  rows: ManualListRow[];
  columns: ManualListColumn[];
  isLoading: boolean;
  toolbarLeadingContent?: ReactNode;
  canDelete?: boolean;
  canPushToCampaigns?: boolean;
  onDeleteRow?: (row: ManualListRow) => void;
  onPushToCampaigns?: (row: ManualListRow) => void;
  getRowLabel?: (row: ManualListRow) => string;
}

export default function ManualListRowsTable({
  rows,
  columns,
  isLoading,
  toolbarLeadingContent,
  canDelete = false,
  canPushToCampaigns = false,
  onDeleteRow,
  onPushToCampaigns,
  getRowLabel,
}: ManualListRowsTableProps) {
  const tableRows = rows.map((row) => flattenRow(row, columns));
  const columnOverrides = Object.fromEntries(
    columns.map((column) => [column.key, { label: column.label }]),
  );

  return (
    <DataTable<ManualListRowTableItem>
      tableId="manual-list-rows"
      rows={tableRows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      excludeFields={['id']}
      columnOverrides={columnOverrides}
      emptyMessage="No rows in this list yet"
      noResultsMessage="No rows match your search."
      toolbarLeadingContent={toolbarLeadingContent}
      enablePagination={rows.length > 25}
      persistPreferences={false}
      rowActions={
        (canPushToCampaigns && onPushToCampaigns) ||
        (canDelete && onDeleteRow)
          ? (row) => {
              const listRow = rows.find((item) => item.id === row.id);
              if (!listRow) {
                return null;
              }

              const label = getRowLabel?.(listRow) ?? 'this row';

              return (
                <>
                  {canPushToCampaigns && onPushToCampaigns ? (
                    <Tooltip title="Add to campaigns">
                      <IconButton
                        size="small"
                        aria-label={`Add ${label} to campaigns`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onPushToCampaigns(listRow);
                        }}
                      >
                        <CampaignOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  {canDelete && onDeleteRow ? (
                    <Tooltip title="Remove from list">
                      <IconButton
                        size="small"
                        aria-label={`Remove ${label} from list`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteRow(listRow);
                        }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </>
              );
            }
          : undefined
      }
    />
  );
}
