'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState } from 'react';
import StageColorField from '@/components/crm/pipeline/StageColorField';
import {
  DEFAULT_STAGE_COLOR,
  normalizeStageColor,
  withAlpha,
} from '@/lib/crm/pipeline/stage-color';

interface AddStageDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: { label: string; color: string }) => Promise<void>;
}

function slugifyLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export default function AddStageDialog({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: AddStageDialogProps) {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState<string>(DEFAULT_STAGE_COLOR);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setLabel('');
    setColor(DEFAULT_STAGE_COLOR);
    onClose();
  }

  async function handleSubmit() {
    const trimmedLabel = label.trim();
    const normalizedColor = normalizeStageColor(color);
    if (!trimmedLabel || !normalizedColor) {
      return;
    }

    await onSubmit({ label: trimmedLabel, color: normalizedColor });
    setLabel('');
    setColor(DEFAULT_STAGE_COLOR);
  }

  const previewValue = slugifyLabel(label);
  const previewColor = normalizeStageColor(color) ?? DEFAULT_STAGE_COLOR;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add pipeline stage</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} className="pt-1">
          <TextField
            label="Stage name"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. Contract Sent"
            autoFocus
            fullWidth
          />
          {previewValue ? (
            <TextField
              label="Stage key"
              value={previewValue}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
              helperText="Used internally for filtering and moves"
            />
          ) : null}

          <StageColorField value={color} onChange={setColor} />

          {label.trim() ? (
            <Box>
              <Typography variant="caption" color="text.secondary" className="mb-2 block">
                Preview
              </Typography>
              <Box
                className="rounded-xl border"
                sx={{
                  borderColor: withAlpha(previewColor, 0.3),
                  bgcolor: withAlpha(previewColor, 0.06),
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  className="border-b px-3 py-2.5"
                  sx={{
                    alignItems: 'center',
                    borderColor: withAlpha(previewColor, 0.2),
                  }}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: previewColor }}
                  />
                  <Typography variant="subtitle2" className="font-semibold">
                    {label.trim()}
                  </Typography>
                </Stack>
                <Box className="px-3 py-3">
                  <Box
                    className="rounded-xl border bg-surface px-3 py-2.5"
                    sx={{ borderColor: withAlpha(previewColor, 0.35) }}
                  >
                    <Typography variant="body2" className="font-semibold">
                      Sample lead
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hover uses your stage color
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={
            isSubmitting || !label.trim() || !normalizeStageColor(color)
          }
        >
          Add stage
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { slugifyLabel };
