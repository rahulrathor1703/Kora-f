'use client';

import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type MouseEvent } from 'react';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface ProspectsMoreFiltersPopoverProps {
  secondaryFields: ProspectFieldDefinition[];
  filters: Record<string, string>;
  activeSecondaryCount: number;
  onApply: (secondaryFilters: Record<string, string>) => void;
}

function pickSecondaryFilters(
  filters: Record<string, string>,
  secondaryFields: ProspectFieldDefinition[],
): Record<string, string> {
  const secondaryKeys = new Set(secondaryFields.map((field) => field.key));

  return Object.fromEntries(
    Object.entries(filters).filter(([key]) => secondaryKeys.has(key)),
  );
}

export default function ProspectsMoreFiltersPopover({
  secondaryFields,
  filters,
  activeSecondaryCount,
  onApply,
}: ProspectsMoreFiltersPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({});

  const open = Boolean(anchorEl);
  const hasSecondaryFields = secondaryFields.length > 0;

  if (!hasSecondaryFields) {
    return null;
  }

  function handleOpen(event: MouseEvent<HTMLElement>) {
    setDraftFilters(pickSecondaryFilters(filters, secondaryFields));
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleDraftChange(key: string, value: string) {
    setDraftFilters((current) => {
      if (!value.trim()) {
        const next = { ...current };
        delete next[key];
        return next;
      }

      return { ...current, [key]: value };
    });
  }

  function handleApply() {
    onApply(draftFilters);
    handleClose();
  }

  function handleClear() {
    setDraftFilters({});
    onApply({});
    handleClose();
  }

  return (
    <>
      <Badge
        color="primary"
        badgeContent={activeSecondaryCount}
        invisible={activeSecondaryCount === 0}
      >
        <Button
          variant={activeSecondaryCount > 0 ? 'contained' : 'outlined'}
          size="small"
          startIcon={<FilterListOutlinedIcon fontSize="small" />}
          onClick={handleOpen}
          className="shrink-0 rounded-xl"
        >
          More filters
        </Button>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            className: 'mt-2 w-[min(100vw-2rem,28rem)] rounded-2xl p-4',
          },
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" className="font-semibold">
              More filters
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Refine by BANT tier, product, region, source, and other fields.
            </Typography>
          </Box>

          <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {secondaryFields.map((field) => (
              <TextField
                key={field.key}
                select
                size="small"
                label={field.label}
                value={draftFilters[field.key] ?? ''}
                onChange={(event) =>
                  handleDraftChange(field.key, event.target.value)
                }
                fullWidth
              >
                <MenuItem value="">All {field.label}</MenuItem>
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>

          <Stack direction="row" spacing={1} className="justify-end">
            <Button variant="outlined" size="small" onClick={handleClear}>
              Clear all
            </Button>
            <Button variant="contained" size="small" onClick={handleApply}>
              Apply filters
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
