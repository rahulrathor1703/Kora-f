'use client';

import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import {
  useCompanyBrowseList,
  useCompanySearch,
} from '@/hooks/useCompanies';
import {
  appendCompanyCreateOptionIfNeeded,
  getCompanyAutocompleteOptionLabel,
  isCompanyCreateOption,
  type CompanyAutocompleteOption,
} from '@/lib/crm/companies/company-search-create-option.util';
import type { Company } from '@/lib/crm/companies/types';

const MIN_SEARCH_LENGTH = 2;
const MENU_ITEM_HEIGHT_PX = 48;
const VISIBLE_COMPANY_ROWS = 5;

interface CompanySearchAutocompleteProps {
  label: string;
  required?: boolean;
  value: Company | null;
  onChange: (company: Company | null) => void;
  disabled?: boolean;
  canAccessCompanyList: boolean;
  canCreateCompany?: boolean;
  onRequestCreate?: (brokerName: string) => void;
  /** Keeps the suggestion list closed (e.g. while inline create drawer is open). */
  suppressDropdown?: boolean;
  helperText?: string;
}

export default function CompanySearchAutocomplete({
  label,
  required = false,
  value,
  onChange,
  disabled = false,
  canAccessCompanyList,
  canCreateCompany = false,
  onRequestCreate,
  suppressDropdown = false,
  helperText,
}: CompanySearchAutocompleteProps) {
  const [searchText, setSearchText] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const resolvedInputValue = value
    ? getCompanyAutocompleteOptionLabel(value)
    : searchText;
  const trimmedInput = resolvedInputValue.trim();
  const isServerSearch = trimmedInput.length >= MIN_SEARCH_LENGTH;
  const listEnabled = canAccessCompanyList && !disabled;

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = useCompanySearch(trimmedInput, listEnabled && isServerSearch);
  const {
    data: browseData,
    isLoading: isBrowseLoading,
    error: browseError,
    refetch: refetchBrowse,
  } = useCompanyBrowseList(listEnabled);

  useEffect(() => {
    if (!listEnabled) {
      return;
    }

    void refetchBrowse();
  }, [listEnabled, refetchBrowse]);

  const loadedOptions = useMemo(() => {
    if (isServerSearch) {
      return searchData?.items ?? [];
    }

    return browseData?.items ?? [];
  }, [browseData?.items, isServerSearch, searchData?.items]);

  const companyOptions = useMemo(() => {
    if (isServerSearch) {
      return loadedOptions;
    }

    const query = trimmedInput.toLowerCase();
    if (!query) {
      return loadedOptions;
    }

    return loadedOptions.filter((company) =>
      getCompanyAutocompleteOptionLabel(company).toLowerCase().includes(query),
    );
  }, [isServerSearch, loadedOptions, trimmedInput]);

  const options = useMemo(
    () =>
      appendCompanyCreateOptionIfNeeded(companyOptions, {
        canCreateCompany: canCreateCompany && Boolean(onRequestCreate),
        trimmedQuery: trimmedInput,
        minSearchLength: MIN_SEARCH_LENGTH,
      }),
    [canCreateCompany, companyOptions, onRequestCreate, trimmedInput],
  );

  const isLoading = isServerSearch ? isSearchLoading : isBrowseLoading;
  const fetchError = isServerSearch ? searchError : browseError;

  const fieldLabel = required ? `${label} *` : label;
  const listboxMaxHeight = MENU_ITEM_HEIGHT_PX * VISIBLE_COMPANY_ROWS;

  const statusHelperText = useMemo(() => {
    if (fetchError) {
      return fetchError;
    }

    if (isLoading && companyOptions.length === 0) {
      return 'Loading companies…';
    }

    if (helperText) {
      return helperText;
    }

    if (canCreateCompany && onRequestCreate) {
      return 'Type to search, or add a new company from the list.';
    }

    if (companyOptions.length === 0) {
      return 'No companies yet. Create them under CRM → Companies, then refresh this page.';
    }

    return undefined;
  }, [
    canCreateCompany,
    companyOptions.length,
    fetchError,
    helperText,
    isLoading,
    onRequestCreate,
  ]);

  if (!canAccessCompanyList) {
    return (
      <TextField
        label={fieldLabel}
        value=""
        fullWidth
        disabled
        helperText="You need permission to view companies before you can select one."
      />
    );
  }

  return (
    <Autocomplete<CompanyAutocompleteOption, false, boolean, false>
      fullWidth
      value={value}
      inputValue={resolvedInputValue}
      onChange={(_event, nextValue, reason) => {
        if (reason === 'clear') {
          onChange(null);
          setSearchText('');
          return;
        }

        if (nextValue && isCompanyCreateOption(nextValue)) {
          setPopupOpen(false);
          setSearchText('');
          onRequestCreate?.(nextValue.brokerName);
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
      getOptionLabel={(option) => getCompanyAutocompleteOptionLabel(option)}
      isOptionEqualToValue={(left, right) => {
        if (isCompanyCreateOption(left) || isCompanyCreateOption(right)) {
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
          ? 'Loading companies…'
          : canCreateCompany && onRequestCreate && trimmedInput.length >= MIN_SEARCH_LENGTH
            ? 'Type a name to add a new company'
            : isServerSearch
              ? 'No companies found'
              : 'No companies in CRM yet'
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
          label={fieldLabel}
          placeholder={value ? undefined : 'Select or type to search…'}
          helperText={statusHelperText}
          error={Boolean(fetchError)}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;

        if (isCompanyCreateOption(option)) {
          return (
            <li key={key} {...optionProps}>
              <Box className="flex items-center gap-2">
                <AddIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="primary">
                  Add &quot;{option.brokerName}&quot;
                </Typography>
              </Box>
            </li>
          );
        }

        return (
          <li key={key} {...optionProps}>
            <Typography variant="body2">
              {getCompanyAutocompleteOptionLabel(option)}
            </Typography>
          </li>
        );
      }}
    />
  );
}
