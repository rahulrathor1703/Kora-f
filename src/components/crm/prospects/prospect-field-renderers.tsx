import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import type {
  ProspectFieldDefinition,
  ProspectFieldOption,
} from '@/lib/crm/prospects/types';
import { normalizeMultiSelectValue } from '@/lib/crm/prospects/product-labels';
import {
  formatLocationDisplayValue,
  isLocationValue,
} from '@/lib/crm/location/types';
import { CRM_EMPTY_CELL_LABEL } from '@/lib/crm/fields/crm-empty-cell';
import {
  formFieldOptionChipSx,
  shouldDisplayProspectOptionsAsChips,
} from '@/lib/forms/form-field-options.utils';
import {
  PROSPECT_BANT_TIER_FIELD_KEY,
  PROSPECT_LEAD_SCORE_FIELD_KEY,
} from '@/lib/crm/prospects/prospect-bant-computed-fields.util';

function renderProspectEmptyCell(): React.ReactNode {
  return (
    <Typography variant="body2" color="text.secondary">
      {CRM_EMPTY_CELL_LABEL}
    </Typography>
  );
}

function findOption(
  field: ProspectFieldDefinition,
  value: string | number | null | undefined,
): ProspectFieldOption | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return field.options?.find((option) => option.value === String(value));
}

function getScoreColor(value: number): string {
  if (value >= 80) {
    return '#22c55e';
  }

  if (value >= 40) {
    return '#f59e0b';
  }

  return '#ef4444';
}

export function renderProspectSelectCell(
  field: ProspectFieldDefinition,
  value: string | number | null | undefined,
  trailingIcon?: React.ReactNode,
): React.ReactNode {
  const option = findOption(field, value);

  if (!option) {
    return renderProspectEmptyCell();
  }

  if (!shouldDisplayProspectOptionsAsChips(field)) {
    return (
      <Box className="inline-flex items-center gap-0.5">
        <Typography variant="body2">{option.label}</Typography>
        {trailingIcon}
      </Box>
    );
  }

  return (
    <Chip
      label={
        trailingIcon ? (
          <Box className="flex items-center gap-0.5">
            <span>{option.label}</span>
            {trailingIcon}
          </Box>
        ) : (
          option.label
        )
      }
      size="small"
      className="rounded-lg font-medium"
      sx={{
        ...formFieldOptionChipSx(option.color),
        ...(trailingIcon
          ? { '& .MuiChip-label': { px: 1 } }
          : undefined),
      }}
      variant="filled"
    />
  );
}

export function renderProspectMultiSelectCell(
  field: ProspectFieldDefinition,
  value: string | number | string[] | null | undefined,
): React.ReactNode {
  const selectedValues = normalizeMultiSelectValue(
    value === null || value === undefined
      ? null
      : Array.isArray(value)
        ? value
        : String(value),
  );

  if (selectedValues.length === 0) {
    return renderProspectEmptyCell();
  }

  return (
    <Box className="flex flex-wrap gap-1">
      {selectedValues.map((selectedValue) => (
        <Box key={selectedValue}>
          {renderProspectSelectCell(field, selectedValue)}
        </Box>
      ))}
    </Box>
  );
}

export function renderProspectScoreCell(
  value: string | number | null | undefined,
): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return renderProspectEmptyCell();
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return renderProspectEmptyCell();
  }

  const color = getScoreColor(numericValue);

  return (
    <Box
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
      sx={{ border: `2px solid ${color}`, color }}
    >
      {numericValue}
    </Box>
  );
}

export function renderProspectDateCell(
  value: string | number | null | undefined,
): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return renderProspectEmptyCell();
  }

  const dateValue = new Date(String(value));
  if (Number.isNaN(dateValue.getTime())) {
    return renderProspectEmptyCell();
  }

  const isOverdue = dateValue.getTime() < Date.now();
  const formatted = dateValue.toISOString().slice(0, 10);

  return (
    <Box className="inline-flex items-center gap-1">
      {isOverdue ? (
        <EventOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
      ) : null}
      <Typography variant="body2">{formatted}</Typography>
    </Box>
  );
}

export function renderProspectTextCell(
  value: string | number | null | undefined,
): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return renderProspectEmptyCell();
  }

  return <Typography variant="body2">{String(value)}</Typography>;
}

export function renderProspectTableCell(
  field: ProspectFieldDefinition,
  row: Record<string, unknown>,
): React.ReactNode {
  if (
    field.key === PROSPECT_LEAD_SCORE_FIELD_KEY ||
    field.key === PROSPECT_BANT_TIER_FIELD_KEY
  ) {
    return renderProspectScoreCell(
      row[PROSPECT_LEAD_SCORE_FIELD_KEY] as string | number | null | undefined,
    );
  }

  const value = row[field.key] as string | number | null | undefined;

  if (field.type === 'location') {
    const locationValue = row[field.key];
    if (!isLocationValue(locationValue)) {
      return renderProspectTextCell(null);
    }

    const label = formatLocationDisplayValue(locationValue);

    return renderProspectTextCell(label || null);
  }

  switch (field.type) {
    case 'select':
      return renderProspectSelectCell(field, value);
    case 'multiselect':
      return renderProspectMultiSelectCell(
        field,
        row[field.key] as string | number | string[] | null | undefined,
      );
    case 'number':
      return renderProspectTextCell(value);
    case 'date':
      return renderProspectDateCell(value);
    case 'email':
      return renderProspectTextCell(value);
    default:
      return renderProspectTextCell(value);
  }
}
