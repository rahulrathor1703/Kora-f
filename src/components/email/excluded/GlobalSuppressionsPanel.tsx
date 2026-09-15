'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import BrowseAllListContactsTable from '@/components/email/audience/BrowseAllListContactsTable';
import { ColumnSettingsButton } from '@/components/data-table/ColumnSettingsDialog';
import DataTable from '@/components/data-table/DataTable';
import { buildFilterValueOptionsFromRows } from '@/components/data-table/filterTableRows';
import { DataTableFilterButton } from '@/components/data-table/DataTableFilterPanel';
import { dataTableClassNames } from '@/components/data-table/dataTableStyles';
import type { DataTableExternalToolbarState } from '@/components/data-table/types';
import { useEmailExcluded } from '@/hooks/useEmailExcluded';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { EmailExcludedAddress } from '@/lib/api/services/email-excluded.service';

type ExcludedPanelTab = 'excluded' | 'exclude';

interface ExcludedRow extends Record<string, unknown> {
  id: string;
  email: string;
  reason: string;
  sourceCampaignId: string | null;
  createdAt: string;
}

function toExcludedRow(address: EmailExcludedAddress): ExcludedRow {
  return {
    id: address.id,
    email: address.email,
    reason: address.reason,
    sourceCampaignId: address.sourceCampaignId,
    createdAt: address.createdAt,
  };
}

function filterExcludedAddresses(
  addresses: EmailExcludedAddress[],
  search: string,
): EmailExcludedAddress[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return addresses;
  }

  return addresses.filter((address) => {
    const haystack = [
      address.email,
      address.reason,
      address.createdAt,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export default function GlobalSuppressionsPanel() {
  const toOrgPath = useOrgPath();
  const { notifySuccess, notifyError } = useNotify();
  const [activeTab, setActiveTab] = useState<ExcludedPanelTab>('excluded');
  const [excludedSearch, setExcludedSearch] = useState('');
  const [browseSearch, setBrowseSearch] = useState('');
  const [browsePage, setBrowsePage] = useState(1);
  const [externalToolbar, setExternalToolbar] =
    useState<DataTableExternalToolbarState | null>(null);

  const {
    addresses,
    isLoading,
    isRemoving,
    isAdding,
    removeAddress,
    addAddress,
    refetch,
  } = useEmailExcluded();

  const filteredAddresses = useMemo(
    () => filterExcludedAddresses(addresses, excludedSearch),
    [addresses, excludedSearch],
  );

  const excludedFilterValueOptions = useMemo(
    () =>
      buildFilterValueOptionsFromRows(
        addresses.map(toExcludedRow),
        ['reason', 'sourceCampaignId', 'createdAt'],
      ),
    [addresses],
  );

  const handleExternalToolbarChange = useCallback(
    (state: DataTableExternalToolbarState | null) => {
      setExternalToolbar((current) => {
        if (state === null) {
          return current === null ? current : null;
        }

        if (
          current &&
          current.showColumnSettings === state.showColumnSettings &&
          current.columnSettingsOpen === state.columnSettingsOpen &&
          current.openColumnSettings === state.openColumnSettings &&
          current.showFieldFilters === state.showFieldFilters &&
          current.filterActive === state.filterActive &&
          current.filterOpen === state.filterOpen &&
          current.activeFilterCount === state.activeFilterCount &&
          current.toggleFieldFilters === state.toggleFieldFilters
        ) {
          return current;
        }

        return state;
      });
    },
    [],
  );

  async function handleExcludeEmail(email: string) {
    try {
      await addAddress(email);
      await refetch();
      notifySuccess(`Excluded ${email} from all future campaigns`);
    } catch {
      notifyError(`Failed to exclude ${email}`);
    }
  }

  return (
    <Stack spacing={3}>
      <Box className="flex flex-col gap-3 border-b border-surface-border lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={activeTab}
          onChange={(_event, value: ExcludedPanelTab) => {
            setActiveTab(value);
            if (value === 'exclude') {
              setBrowsePage(1);
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48 }}
          className="min-w-0 shrink-0"
        >
          <Tab
            value="excluded"
            label={`Excluded (${addresses.length.toLocaleString()})`}
            className="min-h-12 font-semibold normal-case"
          />
          <Tab
            value="exclude"
            label="Exclude"
            className="min-h-12 font-semibold normal-case"
          />
        </Tabs>

        <Box className="flex shrink-0 flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-end lg:pb-0">
          {activeTab === 'excluded' ? (
            <>
              <TextField
                value={excludedSearch}
                onChange={(event) => setExcludedSearch(event.target.value)}
                placeholder="Search..."
                size="small"
                className="w-full rounded-xl sm:w-72"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon
                          sx={{ color: 'text.secondary', fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: excludedSearch ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Clear search"
                          size="small"
                          onClick={() => setExcludedSearch('')}
                          edge="end"
                        >
                          <CloseOutlinedIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />

              <Box className={`${dataTableClassNames.iconButtonGroup} shrink-0`}>
                {externalToolbar?.showFieldFilters ? (
                  <DataTableFilterButton
                    active={externalToolbar.filterActive}
                    open={externalToolbar.filterOpen}
                    activeFilterCount={externalToolbar.activeFilterCount}
                    onClick={externalToolbar.toggleFieldFilters}
                  />
                ) : null}
                {externalToolbar?.showColumnSettings ? (
                  <ColumnSettingsButton
                    active={externalToolbar.columnSettingsOpen}
                    onClick={externalToolbar.openColumnSettings}
                  />
                ) : null}
              </Box>
            </>
          ) : (
            <TextField
              value={browseSearch}
              onChange={(event) => {
                setBrowseSearch(event.target.value);
                setBrowsePage(1);
              }}
              placeholder="Search email, name, or list"
              size="small"
              className="w-full rounded-xl sm:w-72"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon
                        sx={{ color: 'text.secondary', fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: browseSearch ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear search"
                        size="small"
                        onClick={() => {
                          setBrowseSearch('');
                          setBrowsePage(1);
                        }}
                        edge="end"
                      >
                        <CloseOutlinedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          )}
        </Box>
      </Box>

      <Box role="tabpanel">
        {activeTab === 'excluded' ? (
          <DataTable<ExcludedRow>
            tableId="email-excluded"
            rows={filteredAddresses.map(toExcludedRow)}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            hideToolbar
            onExternalToolbarChange={handleExternalToolbarChange}
            excludeFields={['id']}
            columnOverrides={{
              email: { label: 'Email', filterable: false },
              reason: { label: 'Exclusion type' },
              sourceCampaignId: {
                label: 'Campaign',
                render: (row) =>
                  row.sourceCampaignId ? (
                    <Button
                      component={Link}
                      href={toOrgPath(
                        `/email/campaigns/${row.sourceCampaignId}`,
                      )}
                      size="small"
                      className="normal-case"
                    >
                      View campaign
                    </Button>
                  ) : (
                    '—'
                  ),
              },
              createdAt: {
                label: 'Excluded on',
                render: (row) =>
                  new Date(row.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
              },
            }}
            rowActions={(row) => (
              <IconButton
                aria-label={`Remove ${row.email} from excluded list`}
                disabled={isRemoving}
                onClick={() => void removeAddress(row.id)}
                size="small"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            )}
            emptyMessage="No excluded addresses yet"
            noResultsMessage="No excluded addresses match your search."
            enableSearch={false}
            enableFieldFilters
            filterValueOptions={excludedFilterValueOptions}
            enablePagination
            defaultPageSize={25}
          />
        ) : (
          <BrowseAllListContactsTable
            enabled={activeTab === 'exclude'}
            showExcludeAction
            tableId="email-excluded-browse-contacts"
            search={browseSearch}
            page={browsePage}
            onPageChange={setBrowsePage}
            onExcludeEmail={handleExcludeEmail}
            isAdding={isAdding}
          />
        )}
      </Box>
    </Stack>
  );
}
