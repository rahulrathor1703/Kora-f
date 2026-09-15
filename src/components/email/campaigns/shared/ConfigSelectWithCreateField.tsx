'use client';

import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useState } from 'react';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import { useEmailConfigOptions } from '@/hooks/useEmailConfigOptions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import type { EmailConfigCategory } from '@/lib/api';

interface ConfigSelectWithCreateFieldProps {
  category: EmailConfigCategory;
  label: string;
  htmlFor: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; label: string }>;
  isLoading: boolean;
  settingsHref: string;
  placeholder: string;
  emptyMessage: string;
  isError?: boolean;
}

export default function ConfigSelectWithCreateField({
  category,
  label,
  htmlFor,
  value,
  onChange,
  options,
  isLoading,
  settingsHref,
  placeholder,
  emptyMessage,
  isError = false,
}: ConfigSelectWithCreateFieldProps) {
  const { notifySuccess, notifyError } = useNotify();
  const canManageConfig = useHasPermission('email-config:manage');
  const { createOption, isCreating } = useEmailConfigOptions(category);
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const hasOptions = options.length > 0;

  async function handleCreate() {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      return;
    }

    try {
      const created = await createOption({ category, label: trimmed });
      onChange(created.id);
      setNewLabel('');
      setShowCreate(false);
      notifySuccess(`${label} added`);
    } catch (error) {
      notifyError(
        error instanceof Error ? error.message : `Unable to add ${label.toLowerCase()}`,
      );
    }
  }

  return (
    <Box>
      <WizardFieldLabel htmlFor={htmlFor}>{label}</WizardFieldLabel>
      {isLoading ? (
        <Skeleton variant="rounded" height={56} className="rounded-xl" />
      ) : !hasOptions && !isError ? (
        <Alert severity="info" className="rounded-2xl">
          {emptyMessage}
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
                      {placeholder}
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

      <Stack direction="row" spacing={1} className="mt-2 flex-wrap items-center">
        {hasOptions || isError ? (
          <Link
            component={NextLink}
            href={settingsHref}
            variant="caption"
            className="inline-block"
          >
            Manage in settings
          </Link>
        ) : null}
        {canManageConfig ? (
          <Button
            size="small"
            variant="text"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => setShowCreate((current) => !current)}
            className="min-w-0 normal-case"
          >
            Add new {label.toLowerCase()}
          </Button>
        ) : null}
      </Stack>

      {canManageConfig ? (
        <Collapse in={showCreate}>
          <Stack direction="row" spacing={1} className="mt-2">
            <TextField
              size="small"
              fullWidth
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder={`New ${label.toLowerCase()} name`}
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
