'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import StageColorField from '@/components/crm/pipeline/StageColorField';
import {
  DEFAULT_STAGE_COLOR,
  normalizeStageColor,
  withAlpha,
} from '@/lib/crm/pipeline/stage-color';

interface EditStageColorDialogProps {
  open: boolean;
  stageLabel: string;
  initialColor: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (color: string) => Promise<void>;
}

interface EditStageColorFormProps {
  stageLabel: string;
  initialColor: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (color: string) => Promise<void>;
}

function EditStageColorForm({
  stageLabel,
  initialColor,
  isSubmitting,
  onClose,
  onSubmit,
}: EditStageColorFormProps) {
  const [color, setColor] = useState(initialColor);
  const resolvedColor = normalizeStageColor(color) ?? DEFAULT_STAGE_COLOR;

  async function handleSubmit() {
    const normalized = normalizeStageColor(color);
    if (!normalized) {
      return;
    }

    await onSubmit(normalized);
  }

  return (
    <>
      <DialogTitle>Change stage color</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} className="pt-1">
          <Typography variant="body2" color="text.secondary">
            Update the accent color for <strong>{stageLabel}</strong>. Card
            hovers and column accents will use this color.
          </Typography>

          <Box
            className="rounded-xl border px-3 py-2.5"
            sx={{
              borderColor: withAlpha(resolvedColor, 0.35),
              bgcolor: withAlpha(resolvedColor, 0.08),
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: resolvedColor }}
              />
              <Typography variant="subtitle2" className="font-semibold">
                {stageLabel}
              </Typography>
            </Stack>
          </Box>

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
          disabled={isSubmitting || !normalizeStageColor(color)}
        >
          Save color
        </Button>
      </DialogActions>
    </>
  );
}

export default function EditStageColorDialog({
  open,
  stageLabel,
  initialColor,
  isSubmitting,
  onClose,
  onSubmit,
}: EditStageColorDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {open ? (
        <EditStageColorForm
          key={`${stageLabel}-${initialColor}`}
          stageLabel={stageLabel}
          initialColor={initialColor}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
