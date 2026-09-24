'use client';

import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import DataTable from '@/components/data-table/DataTable';
import { useContactLists } from '@/hooks/useContactLists';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useManualLists } from '@/hooks/useManualLists';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  buildUnifiedEmailListRows,
  formatEmailListKindLabel,
  getUnifiedEmailListDetailPath,
  type UnifiedEmailListRow,
} from '@/lib/email/lists/unified-list-rows';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCount(value: number): string {
  return value.toLocaleString();
}

function ListSectionHeading() {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h6" className="font-bold">
        All lists
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Imported contact lists and manual lists in one place.
      </Typography>
    </Stack>
  );
}

export default function ListsContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { lists: contactLists, isLoading: isContactListsLoading } =
    useContactLists();
  const { lists: manualLists, isLoading: isManualListsLoading } =
    useManualLists();
  const canViewManualLists = useHasPermission('manual-lists:read');

  const rows = useMemo(
    () =>
      buildUnifiedEmailListRows(
        contactLists,
        manualLists,
        canViewManualLists,
      ),
    [canViewManualLists, contactLists, manualLists],
  );

  const isLoading =
    isContactListsLoading || (canViewManualLists && isManualListsLoading);

  return (
    <Card className="dashboard-panel rounded-2xl shadow-none">
      <CardContent className="p-4 md:p-6">
        <DataTable<UnifiedEmailListRow>
          tableId="email-lists"
          rows={rows}
          getRowId={(row) => `${row.listType}:${row.id}`}
          isLoading={isLoading}
          onRowClick={(row) => {
            router.push(getUnifiedEmailListDetailPath(row, toOrgPath));
          }}
          includeFields={[
            'name',
            'listType',
            'entryCount',
            'columnCount',
            'createdAt',
          ]}
          emptyMessage="No lists yet. Add your first imported or manual list to get started."
          noResultsMessage="No lists match your search."
          searchPlaceholder="Search lists..."
          toolbarLeadingContent={<ListSectionHeading />}
          columnOverrides={{
            name: { label: 'List name' },
            listType: {
              label: 'List type',
              searchable: true,
              render: (row) => (
                <Chip
                  label={formatEmailListKindLabel(row.listType)}
                  size="small"
                  variant="outlined"
                  className="font-medium"
                  color={row.listType === 'imported' ? 'primary' : 'default'}
                />
              ),
            },
            entryCount: {
              label: 'Entries',
              render: (row) => formatCount(row.entryCount),
            },
            columnCount: {
              label: 'Columns',
              render: (row) =>
                row.columnCount === null ? '—' : formatCount(row.columnCount),
            },
            createdAt: {
              label: 'Created',
              render: (row) => formatDate(row.createdAt),
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
