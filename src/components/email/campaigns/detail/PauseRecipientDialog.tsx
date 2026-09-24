'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';

interface PauseRecipientDialogProps {
  open: boolean;
  email: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (pausedUntil: string) => void;
}

export default function PauseRecipientDialog({
  open,
  email,
  isSubmitting = false,
  onClose,
  onConfirm,
}: PauseRecipientDialogProps) {
  const minDate = useMemo(() => DateTime.now().plus({ days: 1 }).startOf('day'), []);
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);
  const effectiveDate = selectedDate ?? minDate;

  const canConfirm = effectiveDate >= minDate;

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setSelectedDate(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold">Pause recipient</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Choose when to resume the campaign for{' '}
            <Typography component="span" variant="body2" className="font-medium">
              {email}
            </Typography>
            . Sending will continue from the current step after this date.
          </Typography>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <DatePicker
              label="Resume on"
              value={effectiveDate}
              onChange={(value) => setSelectedDate(value)}
              minDate={minDate}
              disabled={isSubmitting}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-5">
        <Button onClick={handleClose} disabled={isSubmitting} color="inherit" className="rounded-xl">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canConfirm || isSubmitting}
          className="rounded-xl"
          onClick={() => {
            onConfirm(effectiveDate.endOf('day').toUTC().toISO()!);
            setSelectedDate(null);
          }}
        >
          Pause
        </Button>
      </DialogActions>
    </Dialog>
  );
}
