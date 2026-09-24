'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { renderProspectMultiSelectCell } from '@/components/crm/prospects/prospect-field-renderers';
import { normalizeMultiSelectValue } from '@/lib/crm/prospects/product-labels';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface ProspectInlineMultiSelectCellProps {
  field: ProspectFieldDefinition;
  value: string | number | string[] | null | undefined;
  disabled?: boolean;
  isSaving?: boolean;
  onSave: (value: string[]) => Promise<void>;
}

export default function ProspectInlineMultiSelectCell({
  field,
  value,
  disabled = false,
  isSaving = false,
  onSave,
}: ProspectInlineMultiSelectCellProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const options = field.options ?? [];
  const selectedValues = normalizeMultiSelectValue(value);

  async function handleChange(nextValues: string[]) {
    const current = normalizeMultiSelectValue(value);
    const unchanged =
      current.length === nextValues.length &&
      current.every((item) => nextValues.includes(item));

    if (unchanged) {
      return;
    }

    await onSave(nextValues);
  }

  return (
    <>
      <Box
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled && !isSaving) {
            setAnchorEl(event.currentTarget);
          }
        }}
        className={`inline-flex min-h-8 min-w-[120px] items-center rounded-lg ${
          disabled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/40'
        }`}
        sx={{ px: 0.5, py: 0.25 }}
      >
        {isSaving ? (
          <CircularProgress size={16} />
        ) : selectedValues.length > 0 ? (
          renderProspectMultiSelectCell(field, value)
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select products…
          </Typography>
        )}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClick={(event) => event.stopPropagation()}
        slotProps={{
          paper: {
            sx: { p: 2, width: 280 },
          },
        }}
      >
        <Autocomplete
          multiple
          disableCloseOnSelect
          open
          options={options}
          value={options.filter((option) => selectedValues.includes(option.value))}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(left, right) => left.value === right.value}
          onChange={(_, nextOptions) => {
            void handleChange(nextOptions.map((option) => option.value));
          }}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;

            return (
              <li key={key} {...optionProps}>
                <Checkbox checked={selected} className="mr-2" size="small" />
                {option.label}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={field.label}
              placeholder="Select products…"
              autoFocus
            />
          )}
        />
      </Popover>
    </>
  );
}
