'use client';

import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DataTable from '@/components/data-table/DataTable';
import { useEmailExcludedListContacts } from '@/hooks/useEmailExcluded';
import { useHasPermission } from '@/hooks/useHasPermission';

export const BROWSE_ALL_LIST_CONTACTS_PAGE_SIZE = 25;

interface BrowseContactRow extends Record<string, unknown> {
  id: string;
  email: string;
  name: string;
  listNames: string[];
  isExcluded: boolean;
  isUnassigned: boolean;
}

export interface BrowseAllListContactsTableProps {
  enabled: boolean;
  showExcludeAction: boolean;
  showStatusColumn?: boolean;
  showAssignAction?: boolean;
  tableId: string;
  search: string;
  page: number;
  onPageChange: (page: number) => void;
  onExcludeEmail?: (email: string) => Promise<void>;
  onAssignContact?: (contact: { email: string; name: string }) => void;
  isAdding?: boolean;
}

function renderListNames(listNames: string[]) {
  if (listNames.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
      {listNames.map((listName) => (
        <Box
          key={listName}
          className="rounded-2xl border border-surface-border px-2.5 py-1 text-sm text-text-secondary"
        >
          {listName}
        </Box>
      ))}
    </Stack>
  );
}

export default function BrowseAllListContactsTable({
  enabled,
  showExcludeAction,
  showStatusColumn = false,
  showAssignAction = false,
  tableId,
  search,
  page,
  onPageChange,
  onExcludeEmail,
  onAssignContact,
  isAdding = false,
}: BrowseAllListContactsTableProps) {
  const canViewManualLists = useHasPermission('manual-lists:read');
  const canAssignToList = useHasPermission('contact-lists:update');

  const { data: browseContactsPage, isLoading: isBrowseLoading, refetch } =
    useEmailExcludedListContacts({
      search,
      page,
      limit: BROWSE_ALL_LIST_CONTACTS_PAGE_SIZE,
      includeManual: canViewManualLists,
      enabled,
    });

  const browseRows: BrowseContactRow[] = (browseContactsPage?.items ?? []).map(
    (contact) => ({
      id: contact.email,
      email: contact.email,
      name: contact.name || '—',
      listNames: contact.listNames,
      isExcluded: contact.isExcluded,
      isUnassigned: contact.isUnassigned,
    }),
  );

  const browseTotal = browseContactsPage?.total ?? 0;
  const includeFields = showStatusColumn
    ? (['name', 'email', 'listNames', 'isExcluded'] as const)
    : (['name', 'email', 'listNames'] as const);
  const excludeFields = showStatusColumn
    ? (['id'] as const)
    : (['id', 'isExcluded'] as const);

  return (
    <Stack spacing={3}>
      <DataTable<BrowseContactRow>
        tableId={tableId}
        rows={browseRows}
        getRowId={(row) => row.id}
        isLoading={isBrowseLoading}
        includeFields={[...includeFields]}
        excludeFields={[...excludeFields]}
        columnOverrides={{
          name: { label: 'Name' },
          email: { label: 'Email' },
          listNames: {
            label: 'Lists',
            render: (row) => renderListNames(row.listNames),
          },
          isExcluded: {
            label: 'Status',
            render: (row) => (
              <Chip
                label={row.isExcluded ? 'Excluded' : 'Active'}
                size="small"
                color={row.isExcluded ? 'default' : 'success'}
                variant="outlined"
                className="font-medium"
              />
            ),
          },
        }}
        rowActions={
          showExcludeAction || (showAssignAction && canAssignToList)
            ? (row) => (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {showAssignAction && canAssignToList && row.isUnassigned ? (
                    <Button
                      size="small"
                      variant="outlined"
                      className="normal-case rounded-xl"
                      disabled={isAdding}
                      startIcon={<PlaylistAddOutlinedIcon fontSize="small" />}
                      onClick={() =>
                        onAssignContact?.({
                          email: row.email,
                          name: row.name === '—' ? '' : row.name,
                        })
                      }
                    >
                      Add to list
                    </Button>
                  ) : null}
                  {showExcludeAction ? (
                    row.isExcluded ? (
                      <Typography variant="caption" color="text.secondary">
                        Already excluded
                      </Typography>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        className="normal-case rounded-xl"
                        disabled={isAdding}
                        startIcon={<BlockOutlinedIcon fontSize="small" />}
                        onClick={() =>
                          void (async () => {
                            await onExcludeEmail?.(row.email);
                            await refetch();
                          })()
                        }
                      >
                        Exclude
                      </Button>
                    )
                  ) : null}
                </Stack>
              )
            : undefined
        }
        emptyMessage="No contacts with valid email addresses found in your lists"
        noResultsMessage="No contacts match your search."
        enableSearch={false}
        enablePagination={false}
        hideToolbar
        persistPreferences={false}
      />

      {browseTotal > BROWSE_ALL_LIST_CONTACTS_PAGE_SIZE ? (
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
        >
          <Typography variant="body2" color="text.secondary">
            Page {page} of{' '}
            {Math.ceil(browseTotal / BROWSE_ALL_LIST_CONTACTS_PAGE_SIZE)}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-xl"
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={
              page * BROWSE_ALL_LIST_CONTACTS_PAGE_SIZE >= browseTotal
            }
            onClick={() => onPageChange(page + 1)}
            className="rounded-xl"
          >
            Next
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
