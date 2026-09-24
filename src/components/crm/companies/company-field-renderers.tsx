import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import {
  formFieldOptionChipSx,
  shouldDisplayCompanyOptionsAsChips,
} from '@/lib/forms/form-field-options.utils';
import type {
  CompanyConfigOption,
  CompanyFieldDefinition,
} from '@/lib/crm/companies/types';
import {
  formatLocationDisplayValue,
  isLocationValue,
} from '@/lib/crm/location/types';

function findSelectOption(
  field: CompanyFieldDefinition,
  value: string | number | null | undefined,
) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return field.options?.find((option) => option.value === String(value));
}

function findConfigOption(
  options: CompanyConfigOption[],
  value: string | number | null | undefined,
) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return options.find((option) => option.id === String(value));
}

export function renderCompanyTableCell(
  field: CompanyFieldDefinition,
  row: Record<string, unknown>,
  configOptions?: {
    categories: CompanyConfigOption[];
    locations: CompanyConfigOption[];
  },
): React.ReactNode {
  const value = row[field.key] as string | number | null | undefined;

  if (field.type === 'location') {
    const locationValue = row[field.key];
    if (!isLocationValue(locationValue)) {
      return <Typography variant="body2">—</Typography>;
    }

    const label = formatLocationDisplayValue(locationValue);

    return (
      <Typography variant="body2" className="max-w-[16rem] truncate" title={label}>
        {label || '—'}
      </Typography>
    );
  }

  if (value === null || value === undefined || value === '') {
    return <Typography variant="body2">—</Typography>;
  }

  if (field.type === 'select') {
    const option = findSelectOption(field, value);
    const label = option?.label ?? String(value);

    if (!shouldDisplayCompanyOptionsAsChips(field)) {
      return <Typography variant="body2">{label}</Typography>;
    }

    return (
      <Chip
        label={label}
        size="small"
        className="rounded-lg font-medium"
        sx={formFieldOptionChipSx(option?.color)}
        variant="filled"
      />
    );
  }

  if (field.type === 'company-category') {
    const option = findConfigOption(configOptions?.categories ?? [], value);
    return (
      <Chip
        label={option?.label ?? '—'}
        size="small"
        variant="outlined"
        className="font-medium"
      />
    );
  }

  if (field.type === 'company-location') {
    const option = findConfigOption(configOptions?.locations ?? [], value);
    return (
      <Chip
        label={option?.label ?? '—'}
        size="small"
        variant="outlined"
        className="font-medium"
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <Typography variant="body2" className="max-w-[16rem] truncate" title={String(value)}>
        {String(value)}
      </Typography>
    );
  }

  return <Typography variant="body2">{String(value)}</Typography>;
}

export function renderCompanyDisplayValue(
  field: CompanyFieldDefinition,
  value: string | number | null | undefined,
  configOptions?: {
    categories: CompanyConfigOption[];
    locations: CompanyConfigOption[];
  },
): string {
  if (field.type === 'location') {
    return '—';
  }

  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (field.type === 'select') {
    const option = findSelectOption(field, value);
    return option?.label ?? String(value);
  }

  if (field.type === 'company-category') {
    const option = findConfigOption(configOptions?.categories ?? [], value);
    return option?.label ?? '—';
  }

  if (field.type === 'company-location') {
    const option = findConfigOption(configOptions?.locations ?? [], value);
    return option?.label ?? '—';
  }

  return String(value);
}
