'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useMemo } from 'react';
import DataTable from '@/components/data-table/DataTable';
import DataTablePagination from '@/components/data-table/DataTablePagination';
import ProspectInlineSelectCell from '@/components/crm/prospects/inline/ProspectInlineSelectCell';
import ProspectRowActions from '@/components/crm/prospects/ProspectRowActions';
import { renderProspectTableCell } from '@/components/crm/prospects/prospect-field-renderers';
import { PIPELINE_STAGE_FIELD_KEY } from '@/lib/crm/pipeline/constants';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import type {
  Prospect,
  ProspectFieldDefinition,
} from '@/lib/crm/prospects/types';

interface ProspectRow extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
}

function flattenProspect(prospect: Prospect): ProspectRow {
  return {
    id: prospect.id,
    fullName: prospect.fullName,
    email: prospect.email,
    ...prospect.values,
  };
}

interface ProspectsTableProps {
  prospects: Prospect[];
  fields: ProspectFieldDefinition[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick?: (row: ProspectRow) => void;
  canUpdate?: boolean;
  onFieldUpdate?: (
    prospectId: string,
    key: string,
    value: FieldStoredValue,
  ) => Promise<void>;
  savingCell?: { prospectId: string; fieldKey: string } | null;
  canRequestDelete?: boolean;
  canDirectDelete?: boolean;
  pendingDeleteRequestProspectIds?: Set<string>;
  onRequestDelete?: (prospect: Prospect) => void;
  onDirectDelete?: (prospect: Prospect) => void;
}

export default function ProspectsTable({
  prospects,
  fields,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  canUpdate = false,
  onFieldUpdate,
  savingCell = null,
  canRequestDelete = false,
  canDirectDelete = false,
  pendingDeleteRequestProspectIds,
  onRequestDelete,
  onDirectDelete,
}: ProspectsTableProps) {
  const tableFields = fields.filter(
    (field) => field.showInTable && field.type !== 'section',
  );
  const rows = prospects.map(flattenProspect);
  const showRowActions =
    (canRequestDelete || canDirectDelete) &&
    onRequestDelete &&
    onDirectDelete;

  const columnOverrides = useMemo(() => {
    const overrides: Record<
      string,
      {
        label: string;
        render?: (row: ProspectRow) => React.ReactNode;
      }
    > = {};

    for (const field of tableFields) {
      overrides[field.key] = {
        label: field.label.toUpperCase(),
        render: (row) => {
          const isSaving =
            savingCell?.prospectId === row.id &&
            savingCell.fieldKey === field.key;

          if (
            canUpdate &&
            onFieldUpdate &&
            field.key === PIPELINE_STAGE_FIELD_KEY
          ) {
            return (
              <ProspectInlineSelectCell
                field={field}
                value={row[field.key] as string | number | null | undefined}
                isSaving={isSaving}
                onSave={async (nextValue) => {
                  await onFieldUpdate(row.id, field.key, nextValue);
                }}
              />
            );
          }

          return renderProspectTableCell(field, row);
        },
      };
    }

    return overrides;
  }, [canUpdate, onFieldUpdate, savingCell, tableFields]);

  const excludeFields = ['id'];
  const tableFieldKeys = useMemo(
    () => tableFields.map((field) => field.key),
    [tableFields],
  );

  return (
    <Paper className="overflow-hidden rounded-2xl">
      <DataTable<ProspectRow>
        tableId="prospects"
        rows={rows}
        getRowId={(row) => row.id}
        excludeFields={excludeFields}
        includeFields={tableFieldKeys}
        columnOverrides={columnOverrides}
        isLoading={isLoading}
        emptyMessage="No prospects yet. Add your first prospect to get started."
        noResultsMessage="No prospects match your search or filters."
        enableSearch={false}
        enablePagination={false}
        persistPreferences
        onRowClick={onRowClick}
        rowActions={
          showRowActions
            ? (row) => {
                const prospect = prospects.find((item) => item.id === row.id);
                if (!prospect) {
                  return null;
                }

                return (
                  <ProspectRowActions
                    prospect={prospect}
                    canRequestDelete={canRequestDelete}
                    canDirectDelete={canDirectDelete}
                    hasPendingDeleteRequest={
                      pendingDeleteRequestProspectIds?.has(prospect.id) ?? false
                    }
                    onRequestDelete={onRequestDelete}
                    onDirectDelete={onDirectDelete}
                  />
                );
              }
            : undefined
        }
      />
      <Box className="border-t border-border/60">
        <DataTablePagination
          page={page - 1}
          pageSize={pageSize}
          totalRows={total}
          onPageChange={(nextPage) => onPageChange(nextPage + 1)}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </Paper>
  );
}
