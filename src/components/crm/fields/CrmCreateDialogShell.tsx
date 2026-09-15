'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface CrmCreateDialogShellProps {
  open: boolean;
  title: string;
  description: string;
  isSubmitting?: boolean;
  submitLabel: string;
  submitDisabled?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}

export default function CrmCreateDialogShell({
  open,
  title,
  description,
  isSubmitting = false,
  submitLabel,
  submitDisabled = false,
  onClose,
  onSubmit,
  children,
}: CrmCreateDialogShellProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      aria-labelledby="crm-create-dialog-title"
    >
      <DialogTitle id="crm-create-dialog-title" className="pb-2">
        <Typography variant="h6" component="span" className="font-bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {description}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: { xs: 2.5, sm: 3 },
          maxHeight: 'min(70vh, 640px)',
        }}
      >
        <Stack spacing={3}>{children}</Stack>
      </DialogContent>
      <DialogActions className="px-4 py-3 sm:px-6 sm:pb-4">
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isSubmitting || submitDisabled}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
