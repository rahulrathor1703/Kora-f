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
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { SaveTemplateScope } from '@/lib/email/campaigns/template-mapping';

interface SaveAsTemplateDialogProps {
  open: boolean;
  templateName: string;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (scope: SaveTemplateScope) => void;
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
  const [scope, setScope] = useState<SaveTemplateScope>('sequence');

  function handleClose() {
    if (isSaving) {
      return;
    }

    setScope('sequence');
    onClose();
  }

  function handleConfirm() {
    onConfirm(scope);
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
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Save <strong>{templateName}</strong> for future campaigns. Choose
              what to include:
            </Typography>

            <RadioGroup
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as SaveTemplateScope)
              }
            >
              <FormControlLabel
                value="sequence"
                control={<Radio size="small" />}
                label={
                  <Stack spacing={0.25}>
                    <Typography variant="body2" className="font-medium">
                      Entire sequence
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Step 1 plus all follow-ups with timing
                    </Typography>
                  </Stack>
                }
                disabled={isSaving}
                sx={{ alignItems: 'flex-start', mx: 0 }}
              />
              <FormControlLabel
                value="single"
                control={<Radio size="small" />}
                label={
                  <Stack spacing={0.25}>
                    <Typography variant="body2" className="font-medium">
                      Step 1 only
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Initial outreach subject and body
                    </Typography>
                  </Stack>
                }
                disabled={isSaving}
                sx={{ alignItems: 'flex-start', mx: 0 }}
              />
            </RadioGroup>
          </Stack>
        </DialogContentText>
      </DialogContent>

      <DialogActions className="px-6 pb-5 pt-2">
        <Button
          onClick={handleClose}
          disabled={isSaving}
          color="inherit"
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
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
