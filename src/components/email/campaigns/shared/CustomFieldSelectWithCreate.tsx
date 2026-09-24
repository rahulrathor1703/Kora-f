'use client';

import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import type { CampaignCustomFieldDefinition } from '@/lib/email/campaigns/custom-field-types';

interface CustomFieldSelectWithCreateProps {
  definition: CampaignCustomFieldDefinition;
  value: string;
  onChange: (value: string) => void;
  onCreateOption: (label: string) => Promise<{ id: string; label: string }>;
  isLoading?: boolean;
  isCreating?: boolean;
  isError?: boolean;
}

export default function CustomFieldSelectWithCreate({
  definition,
  value,
  onChange,
  onCreateOption,
  isLoading = false,
  isCreating = false,
  isError = false,
}: CustomFieldSelectWithCreateProps) {
  const { notifySuccess, notifyError } = useNotify();
  const canManage = useHasPermission('email-campaigns:create');
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const options = definition.options
    .filter((option) => option.isActive)
    .map((option) => ({ id: option.id, label: option.label }));
  const hasOptions = options.length > 0;
  const htmlFor = `advanced-custom-${definition.id}`;

  async function handleCreate() {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      return;
    }

    try {
      const created = await onCreateOption(trimmed);
      onChange(created.id);
      setNewLabel('');
      setShowCreate(false);
      notifySuccess(`${definition.label} option added`);
    } catch (error) {
      notifyError(
        error instanceof Error
          ? error.message
          : `Unable to add ${definition.label.toLowerCase()} option`,
      );
    }
  }

  return (
    <Box>
      <WizardFieldLabel htmlFor={htmlFor}>{definition.label}</WizardFieldLabel>
      {isLoading ? (
        <Skeleton variant="rounded" height={56} className="rounded-xl" />
      ) : !hasOptions && !isError ? (
        <Alert severity="info" className="rounded-2xl">
          No options yet. Add one below or skip for now.
        </Alert>
      ) : (
        <TextField
          id={htmlFor}
          select
          fullWidth
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl"
          slotProps={{
            select: {
              displayEmpty: true,
              renderValue: (selected: unknown) => {
                const selectedValue = String(selected ?? '');

                if (!selectedValue) {
                  return (
                    <Typography component="span" color="text.secondary">
                      Select {definition.label.toLowerCase()}
                    </Typography>
                  );
                }

                return (
                  options.find((option) => option.id === selectedValue)?.label ??
                  selectedValue
                );
              },
            },
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {canManage ? (
        <Stack direction="row" spacing={1} className="mt-2 flex-wrap items-center">
          <Button
            size="small"
            variant="text"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => setShowCreate((current) => !current)}
            className="min-w-0 normal-case"
          >
            Add new {definition.label.toLowerCase()}
          </Button>
        </Stack>
      ) : null}

      {canManage ? (
        <Collapse in={showCreate}>
          <Stack direction="row" spacing={1} className="mt-2">
            <TextField
              size="small"
              fullWidth
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder={`New ${definition.label.toLowerCase()} name`}
              disabled={isCreating}
              className="rounded-xl"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleCreate();
                }
              }}
            />
            <Button
              variant="contained"
              size="small"
              disabled={!newLabel.trim() || isCreating}
              onClick={() => void handleCreate()}
              className="shrink-0 rounded-xl normal-case shadow-none"
            >
              {isCreating ? 'Adding…' : 'Add'}
            </Button>
          </Stack>
        </Collapse>
      ) : null}
    </Box>
  );
}
