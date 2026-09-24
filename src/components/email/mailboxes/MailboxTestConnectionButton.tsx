'use client';

import CableOutlinedIcon from '@mui/icons-material/CableOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Button from '@mui/material/Button';

interface MailboxTestConnectionButtonProps {
  passed: boolean;
  fullWidth?: boolean;
  onClick: () => void;
}

export default function MailboxTestConnectionButton({
  passed,
  fullWidth = false,
  onClick,
}: MailboxTestConnectionButtonProps) {
  if (passed) {
    return (
      <Button
        variant="outlined"
        size="small"
        fullWidth={fullWidth}
        disabled
        disableElevation
        endIcon={<CheckCircleOutlinedIcon fontSize="small" />}
        className="mailbox-test-connection-button-passed rounded-lg normal-case whitespace-nowrap"
      >
        Connection Live
      </Button>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      fullWidth={fullWidth}
      startIcon={<CableOutlinedIcon fontSize="small" />}
      onClick={onClick}
      className="rounded-lg normal-case whitespace-nowrap"
      sx={{ color: 'text.primary', borderColor: 'divider' }}
    >
      Test connection
    </Button>
  );
}
