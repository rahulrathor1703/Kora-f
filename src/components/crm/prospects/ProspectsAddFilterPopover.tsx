'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useMemo, useState, type MouseEvent } from 'react';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface ProspectsAddFilterPopoverProps {
  /** Fields the user is allowed to filter on (admin-enabled). */
  availableFields: ProspectFieldDefinition[];
  filters: Record<string, string>;
  activeOptionalFilterCount: number;
  onAddFilter: (fieldKey: string, value: string) => void;
  configureFiltersHref?: string;
}

export default function ProspectsAddFilterPopover({
  availableFields,
  filters,
  activeOptionalFilterCount,
  onAddFilter,
  configureFiltersHref,
}: ProspectsAddFilterPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  const open = Boolean(anchorEl);

  const selectedField = useMemo(
    () => availableFields.find((field) => field.key === selectedFieldKey),
    [availableFields, selectedFieldKey],
  );

  function handleOpen(event: MouseEvent<HTMLElement>) {
    setSelectedFieldKey('');
    setSelectedValue('');
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleFieldChange(fieldKey: string) {
    setSelectedFieldKey(fieldKey);
    setSelectedValue(filters[fieldKey] ?? '');
  }

  function handleAdd() {
    if (!selectedFieldKey || !selectedValue.trim()) {
      return;
    }

    onAddFilter(selectedFieldKey, selectedValue);
    handleClose();
  }

  const canAdd = Boolean(selectedFieldKey && selectedValue.trim());

  return (
    <>
      <Badge
        color="primary"
        badgeContent={activeOptionalFilterCount}
        invisible={activeOptionalFilterCount === 0}
      >
        <Button
          variant={activeOptionalFilterCount > 0 ? 'contained' : 'outlined'}
          size="small"
          startIcon={<AddOutlinedIcon fontSize="small" />}
          onClick={handleOpen}
          className="shrink-0 rounded-xl"
        >
          Add filter
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
            className: 'mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl p-4',
          },
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle2" className="font-semibold">
              Add filter
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Choose a field and value to narrow the board or list.
            </Typography>
          </Box>

          {availableFields.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No filters are available yet.
              {configureFiltersHref ? (
                <>
                  {' '}
                  An admin can turn on fields in{' '}
                  <Link
                    component={NextLink}
                    href={configureFiltersHref}
                    underline="hover"
                  >
                    Settings → Manage Forms → Pipeline filters
                  </Link>
                  .
                </>
              ) : (
                ' Ask an admin to enable pipeline filters for your workspace.'
              )}
            </Typography>
          ) : (
            <>
              <TextField
                select
                size="small"
                label="Field"
                value={selectedFieldKey}
                onChange={(event) => handleFieldChange(event.target.value)}
                fullWidth
              >
                <MenuItem value="">Select field…</MenuItem>
                {availableFields.map((field) => (
                  <MenuItem key={field.key} value={field.key}>
                    {field.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Value"
                value={selectedValue}
                onChange={(event) => setSelectedValue(event.target.value)}
                disabled={!selectedField}
                fullWidth
              >
                <MenuItem value="">Select value…</MenuItem>
                {selectedField?.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={1} className="justify-end">
                <Button variant="outlined" size="small" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disabled={!canAdd}
                  onClick={handleAdd}
                >
                  Add filter
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Popover>
    </>
  );
}
