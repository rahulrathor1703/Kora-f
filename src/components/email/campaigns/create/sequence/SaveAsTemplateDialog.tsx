'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
import Typography from '@mui/material/Typography';

interface SaveAsTemplateDialogProps {
  open: boolean;
  templateName: string;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const titleId = 'save-template-dialog-title';
const descriptionId = 'save-template-dialog-description';

export default function SaveAsTemplateDialog({
  open,
  templateName,
  isSaving,
  onClose,
  onConfirm,
}: SaveAsTemplateDialogProps) {
  function handleClose() {
    if (isSaving) {
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
              bgcolor: 'primary.main',
              color: 'common.white',
              flexShrink: 0,
            }}
          >
            <InfoOutlinedIcon fontSize="small" />
          </Box>
          <span className="font-bold">Save as template</span>
        </Stack>
      </DialogTitle>

      <DialogContent className="pt-0">
        <DialogContentText id={descriptionId} component="div" color="text.secondary">
          <Typography variant="body2" color="text.secondary">
            Save <strong>{templateName}</strong> as a reusable template? Your
            opening email and any follow-ups will be included.
          </Typography>
        </DialogContentText>
      </DialogContent>

      <DialogActions className="px-6 pb-5 pt-2">
        <Button
          type="button"
          onClick={handleClose}
          disabled={isSaving}
          color="inherit"
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          color="primary"
          variant="contained"
          disabled={isSaving}
          className="rounded-xl"
          startIcon={
            isSaving ? <CircularProgress size={18} color="inherit" /> : undefined
          }
        >
          {isSaving ? 'Saving…' : 'Save template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
