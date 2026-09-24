'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import type { ManualListColumn } from '@/lib/lists/types';

export interface AddManualRowSubmitOptions {
  pushToCampaigns?: boolean;
}

interface AddManualRowDialogProps {
  open: boolean;
  columns: ManualListColumn[];
  isSubmitting: boolean;
  canPushToCampaigns?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (
    values: Record<string, string>,
    options?: AddManualRowSubmitOptions,
  ) => Promise<void>;
}

export default function AddManualRowDialog({
  open,
  columns,
  isSubmitting,
  canPushToCampaigns = false,
  error,
  onClose,
  onSubmit,
}: AddManualRowDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  function handleClose() {
    setValues({});
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add row</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          {error ? (
            <Alert severity="error" className="rounded-2xl">
              {error}
            </Alert>
          ) : null}
          {columns.map((column) => (
            <TextField
              key={column.key}
              label={column.label}
              value={values[column.key] ?? ''}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [column.key]: event.target.value,
                }))
              }
              fullWidth
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        {canPushToCampaigns ? (
          <Button
            variant="outlined"
            onClick={() => void onSubmit(values, { pushToCampaigns: true })}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Add & push to campaigns
          </Button>
        ) : null}
        <Button
          variant="contained"
          onClick={() => void onSubmit(values)}
          disabled={isSubmitting}
          className="rounded-xl"
        >
          Add row
        </Button>
      </DialogActions>
    </Dialog>
  );
}
