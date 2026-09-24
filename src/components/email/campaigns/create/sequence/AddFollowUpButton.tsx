'use client';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface AddFollowUpButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function AddFollowUpButton({
  onClick,
  disabled = false,
}: AddFollowUpButtonProps) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center' }} className="pt-1">
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onClick}
        disabled={disabled}
        className="rounded-2xl px-5"
      >
        Add follow-up
      </Button>
      <Typography variant="caption" color="text.secondary" className="text-center">
        Follow-ups send only when the previous email gets no reply.
      </Typography>
    </Stack>
  );
}
