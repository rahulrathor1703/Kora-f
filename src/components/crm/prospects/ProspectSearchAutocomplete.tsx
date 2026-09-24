'use client';

import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import {
  useProspectBrowseList,
  useProspectSearch,
} from '@/hooks/useProspects';
import {
  appendProspectCreateOptionIfNeeded,
  getProspectAutocompleteOptionLabel,
  isProspectCreateOption,
  type ProspectAutocompleteOption,
} from '@/lib/crm/prospects/prospect-search-create-option.util';
import type { ProspectSearchResult } from '@/lib/crm/prospects/types';

const MIN_SEARCH_LENGTH = 2;
const MENU_ITEM_HEIGHT_PX = 48;
const VISIBLE_PROSPECT_ROWS = 5;

interface ProspectSearchAutocompleteProps {
  label: string;
  required?: boolean;
  value: ProspectSearchResult | null;
  onChange: (prospect: ProspectSearchResult | null) => void;
  disabled?: boolean;
  canAccessProspectList: boolean;
  canCreateProspect?: boolean;
  onRequestCreate?: (displayName: string) => void;
  suppressDropdown?: boolean;
  helperText?: string;
  uppercaseLabel?: boolean;
}

export default function ProspectSearchAutocomplete({
  label,
  required = false,
  value,
  onChange,
  disabled = false,
  canAccessProspectList,
  canCreateProspect = false,
  onRequestCreate,
  suppressDropdown = false,
  helperText,
  uppercaseLabel = false,
}: ProspectSearchAutocompleteProps) {
  const [searchText, setSearchText] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const resolvedInputValue = value
    ? getProspectAutocompleteOptionLabel(value)
    : searchText;
  const trimmedInput = resolvedInputValue.trim();
  const isServerSearch = trimmedInput.length >= MIN_SEARCH_LENGTH;
  const listEnabled = canAccessProspectList && !disabled;

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = useProspectSearch(trimmedInput, listEnabled && isServerSearch);
  const {
    data: browseData,
    isLoading: isBrowseLoading,
    error: browseError,
    refetch: refetchBrowse,
  } = useProspectBrowseList(listEnabled);

  useEffect(() => {
    if (!listEnabled) {
      return;
    }

    void refetchBrowse();
  }, [listEnabled, refetchBrowse]);

  const loadedOptions = useMemo(() => {
    if (isServerSearch) {
      return searchData ?? [];
    }

    return browseData ?? [];
  }, [browseData, isServerSearch, searchData]);

  const prospectOptions = useMemo(() => {
    if (isServerSearch) {
      return loadedOptions;
    }

    const query = trimmedInput.toLowerCase();
    if (!query) {
      return loadedOptions;
    }

    return loadedOptions.filter((prospect) =>
      getProspectAutocompleteOptionLabel(prospect).toLowerCase().includes(query),
    );
  }, [isServerSearch, loadedOptions, trimmedInput]);

  const options = useMemo(
    () =>
      appendProspectCreateOptionIfNeeded(prospectOptions, {
        canCreateProspect: canCreateProspect && Boolean(onRequestCreate),
        trimmedQuery: trimmedInput,
        minSearchLength: MIN_SEARCH_LENGTH,
      }),
    [canCreateProspect, onRequestCreate, prospectOptions, trimmedInput],
  );

  const isLoading = isServerSearch ? isSearchLoading : isBrowseLoading;
  const fetchError = isServerSearch ? searchError : browseError;

  const fieldLabel = required ? `${label} *` : label;
  const listboxMaxHeight = MENU_ITEM_HEIGHT_PX * VISIBLE_PROSPECT_ROWS;

  const statusHelperText = useMemo(() => {
    if (fetchError) {
      return fetchError;
    }

    if (isLoading && prospectOptions.length === 0) {
      return 'Loading prospects…';
    }

    if (helperText) {
      return helperText;
    }

    return undefined;
  }, [fetchError, helperText, isLoading, prospectOptions.length]);

  if (!canAccessProspectList) {
    return (
      <TextField
        label={uppercaseLabel ? undefined : fieldLabel}
        value=""
        fullWidth
        disabled
        helperText="You need permission to view prospects before you can select one."
      />
    );
  }

  return (
    <Autocomplete<ProspectAutocompleteOption, false, boolean, false>
      fullWidth
      value={value}
      inputValue={resolvedInputValue}
      onChange={(_event, nextValue, reason) => {
        if (reason === 'clear') {
          onChange(null);
          setSearchText('');
          return;
        }

        if (nextValue && isProspectCreateOption(nextValue)) {
          setPopupOpen(false);
          setSearchText('');
          onRequestCreate?.(nextValue.displayName);
          return;
        }

        onChange(nextValue);
        if (!nextValue) {
          setSearchText('');
        }
      }}
      onInputChange={(_event, nextInputValue, reason) => {
        if (reason === 'reset') {
          return;
        }

        if (value && reason === 'input') {
          onChange(null);
        }

        setSearchText(nextInputValue);
      }}
      open={suppressDropdown ? false : popupOpen}
      onOpen={() => {
        if (suppressDropdown) {
          return;
        }

        setPopupOpen(true);
        void refetchBrowse();
      }}
      onClose={() => {
        setPopupOpen(false);
      }}
      options={options}
      getOptionLabel={(option) => getProspectAutocompleteOptionLabel(option)}
      isOptionEqualToValue={(left, right) => {
        if (isProspectCreateOption(left) || isProspectCreateOption(right)) {
          return false;
        }

        return left.id === right.id;
      }}
      filterOptions={(items) => items}
      loading={isLoading}
      disabled={disabled}
      openOnFocus
      disableClearable={!required}
      noOptionsText={
        isLoading
          ? 'Loading prospects…'
          : canCreateProspect &&
              onRequestCreate &&
              trimmedInput.length >= MIN_SEARCH_LENGTH
            ? 'Type a name to add a new contact'
            : isServerSearch
              ? 'No prospects found'
              : 'No prospects in CRM yet'
      }
      slotProps={{
        popper: {
          placement: 'bottom-start',
          sx: { zIndex: (theme) => theme.zIndex.modal + 2 },
        },
        paper: {
          sx: { maxHeight: listboxMaxHeight + 16 },
        },
        listbox: {
          sx: {
            maxHeight: listboxMaxHeight,
            overflowY: 'auto',
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={uppercaseLabel ? undefined : fieldLabel}
          placeholder={value ? undefined : 'Select or type to search…'}
          helperText={statusHelperText}
          error={Boolean(fetchError)}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;

        if (isProspectCreateOption(option)) {
          return (
            <li key={key} {...optionProps}>
              <Box className="flex items-center gap-2">
                <AddIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="primary">
                  Add &quot;{option.displayName}&quot;
                </Typography>
              </Box>
            </li>
          );
        }

        return (
          <li key={key} {...optionProps}>
            <Typography variant="body2">
              {getProspectAutocompleteOptionLabel(option)}
            </Typography>
          </li>
        );
      }}
    />
  );
}
