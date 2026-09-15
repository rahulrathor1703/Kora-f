'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useProspectSearch, useProspects } from '@/hooks/useProspects';
import { resolveManualListColumnKeys } from '@/lib/lists/column-utils';
import {
  detectManualListProspectFieldMapping,
  mapProspectToManualListRow,
} from '@/lib/lists/manual-list-payload';
import type { ProspectSearchResult } from '@/lib/crm/prospects/types';
import type { ManualListBuilderFormValues } from '@/lib/schemas/manual-list';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function resetPickerState(
  setSearchInput: (value: string) => void,
  setSelectedProspects: (value: ProspectSearchResult[]) => void,
) {
  setSearchInput('');
  setSelectedProspects([]);
}

export default function ManualListProspectPicker() {
  const { control, getValues, setValue } =
    useFormContext<ManualListBuilderFormValues>();
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedProspects, setSelectedProspects] = useState<
    ProspectSearchResult[]
  >([]);

  const watchedColumns = useWatch({ control, name: 'columns' });
  const resolvedColumns = useMemo(
    () =>
      resolveManualListColumnKeys(
        (watchedColumns ?? []).map((column) => column.label),
      ).filter((column) => column.key),
    [watchedColumns],
  );

  const trimmedSearch = searchInput.trim();
  const isSearching = trimmedSearch.length >= 2;
  const { data: searchResults, isLoading: isSearchLoading } = useProspectSearch(
    trimmedSearch,
    isOpen && isSearching,
  );
  const { data: browseResults, isLoading: isBrowseLoading } = useProspects({
    page: 1,
    pageSize: 25,
  });

  const options = isSearching
    ? (searchResults ?? [])
    : (browseResults?.items.map((prospect) => ({
        id: prospect.id,
        fullName: prospect.fullName,
        email: prospect.email,
      })) ?? []);

  function handleClose() {
    setIsOpen(false);
    resetPickerState(setSearchInput, setSelectedProspects);
  }

  function handleAddProspects() {
    if (selectedProspects.length === 0 || resolvedColumns.length === 0) {
      return;
    }

    const currentRows = getValues('rows');
    const emailColumnKey = detectManualListProspectFieldMapping(
      resolvedColumns.map((column) => ({
        label: column.label,
        key: column.key,
      })),
    )?.emailColumnKey;

    const existingEmails = new Set(
      currentRows
        .map((row) => {
          if (!emailColumnKey) {
            return '';
          }
          return normalizeEmail(row.values[emailColumnKey] ?? '');
        })
        .filter(Boolean),
    );

    const newRows = selectedProspects
      .filter((prospect) => {
        const email = normalizeEmail(prospect.email);
        return email.length > 0 && !existingEmails.has(email);
      })
      .map((prospect) => ({
        values: mapProspectToManualListRow(prospect, resolvedColumns),
      }));

    if (newRows.length > 0) {
      setValue('rows', [...currentRows, ...newRows], { shouldDirty: true });
    }

    handleClose();
  }

  const canAdd =
    selectedProspects.length > 0 && resolvedColumns.length > 0;

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outlined"
        size="small"
        startIcon={<PersonAddOutlinedIcon />}
        onClick={() => setIsOpen(true)}
        className="self-start rounded-xl"
      >
        Add from CRM
      </Button>
    );
  }

  return (
    <Box className="rounded-xl border border-surface-border px-3 py-2.5">
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="body2" className="font-semibold">
              Add from CRM Prospects
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              className="mt-0.5 block"
            >
              Search prospects, select one or more, then add them to your list.
            </Typography>
          </Box>
          <IconButton
            type="button"
            size="small"
            aria-label="Close"
            onClick={handleClose}
            className="shrink-0"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'flex-start' } }}
        >
          <Autocomplete
            multiple
            fullWidth
            options={options}
            loading={isSearching ? isSearchLoading : isBrowseLoading}
            value={selectedProspects}
            inputValue={searchInput}
            onInputChange={(_event, value) => setSearchInput(value)}
            onChange={(_event, value) => setSelectedProspects(value)}
            getOptionLabel={(prospect) =>
              prospect.fullName
                ? `${prospect.fullName} (${prospect.email})`
                : prospect.email
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(items) => items}
            noOptionsText={
              isSearching
                ? 'No prospects found'
                : 'Type to search prospects'
            }
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Prospects"
                placeholder="Search by name or email…"
                autoFocus
              />
            )}
            renderOption={(props, prospect) => (
              <li {...props} key={prospect.id}>
                <Stack>
                  <Typography variant="body2" className="font-medium">
                    {prospect.fullName || 'Unnamed prospect'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {prospect.email}
                  </Typography>
                </Stack>
              </li>
            )}
          />

          <Button
            type="button"
            variant="contained"
            onClick={handleAddProspects}
            disabled={!canAdd}
            className="shrink-0 rounded-xl"
            sx={{ minWidth: { sm: 120 }, mt: { xs: 0, sm: 0.25 } }}
          >
            Add to list
          </Button>
        </Stack>

        {selectedProspects.length > 0 ? (
          <Typography variant="caption" color="text.secondary">
            {selectedProspects.length} prospect
            {selectedProspects.length === 1 ? '' : 's'} selected
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
