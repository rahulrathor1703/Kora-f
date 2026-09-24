'use client';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import Button from '@mui/material/Button';

interface FixSpamRatingButtonProps {
  fullWidth?: boolean;
  onClick: () => void;
}

export default function FixSpamRatingButton({
  fullWidth = false,
  onClick,
}: FixSpamRatingButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      fullWidth={fullWidth}
      startIcon={<AutoFixHighOutlinedIcon fontSize="small" />}
      onClick={onClick}
      className="rounded-lg normal-case whitespace-nowrap"
      sx={{ color: 'text.primary', borderColor: 'divider' }}
    >
      Fix spam rating
    </Button>
  );
}
