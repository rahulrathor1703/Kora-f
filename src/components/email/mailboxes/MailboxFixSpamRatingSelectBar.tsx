'use client';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface MailboxFixSpamRatingSelectBarProps {
  selectedCount: number;
  onCancel: () => void;
  onContinue: () => void;
}

export default function MailboxFixSpamRatingSelectBar({
  selectedCount,
  onCancel,
  onContinue,
}: MailboxFixSpamRatingSelectBarProps) {
  return (
    <Box className="mailbox-fix-spam-select-bar rounded-2xl border border-surface-border px-4 py-3">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <AutoFixHighOutlinedIcon fontSize="small" />
          </Box>
          <Box className="min-w-0">
            <Typography variant="subtitle2" className="font-bold">
              Select mailboxes to fix spam rating
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedCount === 0
                ? 'Choose one or more mailboxes, then continue to pricing.'
                : `${selectedCount} mailbox${selectedCount === 1 ? '' : 'es'} selected`}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} className="shrink-0">
          <Button onClick={onCancel} variant="text" className="rounded-xl normal-case">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={selectedCount === 0}
            onClick={onContinue}
            className="rounded-xl normal-case shadow-primary-soft"
          >
            Continue
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
