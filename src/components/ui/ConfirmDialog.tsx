'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';

export type ConfirmDialogVariant = 'destructive' | 'warning' | 'default';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  variant?: ConfirmDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const titleId = 'confirm-dialog-title';
const descriptionId = 'confirm-dialog-description';

function getVariantConfig(variant: ConfirmDialogVariant) {
  switch (variant) {
    case 'destructive':
      return {
        icon: DeleteOutlineOutlinedIcon,
        iconBg: 'error.main',
        confirmColor: 'error' as const,
      };
    case 'warning':
      return {
        icon: WarningAmberOutlinedIcon,
        iconBg: 'warning.main',
        confirmColor: 'warning' as const,
      };
    default:
      return {
        icon: InfoOutlinedIcon,
        iconBg: 'primary.main',
        confirmColor: 'primary' as const,
      };
  }
}

export default function ConfirmDialog({
  open,
  title,
  description,
  variant = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const { icon: Icon, iconBg, confirmColor } = getVariantConfig(variant);

  function handleClose() {
    if (isLoading) {
      return;
    }

    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slots={{ transition: Fade }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(6px)',
          },
        },
        paper: {
          sx: {
            transform: open ? 'scale(1)' : 'scale(0.96)',
            transition: 'transform 0.2s ease',
          },
        },
      }}
    >
      <DialogTitle id={titleId} className="pb-2 pt-6">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: iconBg,
              color: 'common.white',
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <span className="font-bold">{title}</span>
        </Stack>
      </DialogTitle>

      <DialogContent className="pt-0">
        <DialogContentText id={descriptionId} component="div" color="text.secondary">
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions className="px-6 pb-5 pt-2">
        <Button
          onClick={handleClose}
          disabled={isLoading}
          color="inherit"
          className="rounded-xl"
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          disabled={isLoading}
          className="rounded-xl"
          startIcon={
            isLoading ? <CircularProgress size={18} color="inherit" /> : undefined
          }
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
