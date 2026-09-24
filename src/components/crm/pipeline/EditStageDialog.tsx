'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import StageColorField from '@/components/crm/pipeline/StageColorField';
import {
  DEFAULT_STAGE_COLOR,
  normalizeStageColor,
} from '@/lib/crm/pipeline/stage-color';

interface EditStageDialogProps {
  open: boolean;
  stageLabel: string;
  initialColor: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: { label: string; color: string }) => Promise<void>;
}

function EditStageDialogForm({
  stageLabel,
  initialColor,
  isSubmitting,
  onClose,
  onSubmit,
}: Omit<EditStageDialogProps, 'open'>) {
  const [label, setLabel] = useState(stageLabel);
  const [color, setColor] = useState(initialColor);

  async function handleSubmit() {
    const trimmedLabel = label.trim();
    const normalizedColor = normalizeStageColor(color);
    if (!trimmedLabel || !normalizedColor) {
      return;
    }

    await onSubmit({ label: trimmedLabel, color: normalizedColor });
  }

  return (
    <>
      <DialogContent>
        <Stack spacing={2.5} className="pt-1">
          <TextField
            label="Stage name"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            autoFocus
            fullWidth
          />
          <StageColorField value={color} onChange={setColor} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={
            isSubmitting ||
            !label.trim() ||
            !normalizeStageColor(color ?? DEFAULT_STAGE_COLOR)
          }
        >
          Save changes
        </Button>
      </DialogActions>
    </>
  );
}

export default function EditStageDialog({
  open,
  stageLabel,
  initialColor,
  isSubmitting,
  onClose,
  onSubmit,
}: EditStageDialogProps) {
  function handleClose() {
    if (isSubmitting) {
      return;
    }

    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit pipeline stage</DialogTitle>
      {open ? (
        <EditStageDialogForm
          key={`${stageLabel}-${initialColor}`}
          stageLabel={stageLabel}
          initialColor={initialColor}
          isSubmitting={isSubmitting}
          onClose={handleClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
