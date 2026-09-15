'use client';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocationApiStatus, useLocationSearch } from '@/hooks/useLocationSearch';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { LocationSearchResult } from '@/lib/api/services/location.service';
import {
  DEFAULT_LOCATION_COMPONENTS,
  buildLocationDisplayLabel,
  formatLocationDisplayValue,
  normalizeLocationComponents,
  normalizeLocationInputMode,
  type LocationComponent,
  type LocationInputMode,
  type LocationValue,
} from '@/lib/crm/location/types';

interface LocationFieldGroupProps {
  label: string;
  required?: boolean;
  components?: LocationComponent[];
  inputMode?: LocationInputMode;
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  disabled?: boolean;
  uppercaseLabel?: boolean;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function mergeLocationValue(
  result: LocationSearchResult,
  components: LocationComponent[],
): LocationValue {
  const next: LocationValue = {
    city: null,
    state: null,
    country: null,
    region: null,
  };

  for (const component of components) {
    next[component] = result[component]?.trim() || null;
  }

  return next;
}

function toManualLocationValue(text: string): LocationValue {
  const trimmed = text.trim();
  return {
    city: trimmed.length > 0 ? trimmed : null,
    state: null,
    country: null,
    region: null,
  };
}

export default function LocationFieldGroup({
  label,
  required = false,
  components,
  inputMode = 'api',
  value,
  onChange,
  disabled = false,
}: LocationFieldGroupProps) {
  const toOrgPath = useOrgPath();
  const normalizedComponents = useMemo(
    () =>
      normalizeLocationComponents(components).length > 0
        ? normalizeLocationComponents(components)
        : [...DEFAULT_LOCATION_COMPONENTS],
    [components],
  );
  const normalizedInputMode = normalizeLocationInputMode(inputMode);
  const fieldLabel = required ? `${label} *` : label;
  const [query, setQuery] = useState(() => formatLocationDisplayValue(value));
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: status } = useLocationApiStatus();
  const { data: suggestions = [], isFetching } = useLocationSearch(
    debouncedQuery,
    normalizedComponents,
    'city',
    normalizedInputMode === 'api' && (status?.isConfigured ?? false),
  );

  if (normalizedInputMode === 'manual') {
    return (
      <TextField
        label={fieldLabel}
        value={value.city ?? ''}
        onChange={(event) => onChange(toManualLocationValue(event.target.value))}
        fullWidth
        disabled={disabled}
        placeholder="Enter location"
      />
    );
  }

  if (status && !status.isConfigured) {
    return (
      <Alert severity="warning" className="rounded-2xl">
        Location API is not configured.{' '}
        <Link
          component={NextLink}
          href={toOrgPath('/crm/configuration/location-api')}
          variant="caption"
        >
          Configure in CRM Configuration
        </Link>
      </Alert>
    );
  }

  return (
    <Autocomplete<LocationSearchResult, false, false, true>
      options={suggestions}
      loading={isFetching}
      disabled={disabled}
      freeSolo
      value={null}
      inputValue={query}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.displayLabel
      }
      isOptionEqualToValue={(left, right) =>
        typeof left === 'string' || typeof right === 'string'
          ? left === right
          : left.displayLabel === right.displayLabel
      }
      filterOptions={(options) => options}
      onInputChange={(_, nextInput, reason) => {
        if (reason === 'reset') {
          return;
        }

        setQuery(nextInput);
        onChange(toManualLocationValue(nextInput));
      }}
      onChange={(_, option) => {
        if (!option) {
          return;
        }

        if (typeof option === 'string') {
          onChange(toManualLocationValue(option));
          setQuery(option);
          return;
        }

        const nextValue = mergeLocationValue(option, normalizedComponents);
        onChange(nextValue);
        setQuery(formatLocationDisplayValue(nextValue));
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={fieldLabel}
          placeholder="Search location…"
          helperText={
            debouncedQuery.trim().length >= 2
              ? 'Select a suggestion to fill location details'
              : undefined
          }
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.displayLabel}>
          {option.displayLabel ||
            buildLocationDisplayLabel(
              {
                city: option.city ?? null,
                state: option.state ?? null,
                country: option.country ?? null,
                region: option.region ?? null,
              },
              normalizedComponents,
            )}
        </li>
      )}
      noOptionsText={
        debouncedQuery.trim().length < 2
          ? 'Type at least 2 characters'
          : 'No locations found'
      }
    />
  );
}

export { emptyLocationValue } from '@/lib/crm/location/types';
