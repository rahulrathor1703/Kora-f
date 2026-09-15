'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { getModeColors } from '@/theme/colors';
import { useThemeMode } from '@/theme/ThemeModeProvider';

interface SubmitButtonProps {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export default function SubmitButton({
  label,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
}: SubmitButtonProps) {
  const { mode } = useThemeMode();
  const colors = getModeColors(mode);

  return (
    <Button
      type={type}
      variant="contained"
      color="primary"
      size="large"
      disabled={disabled || loading}
      onClick={onClick}
      className="rounded-xl px-6 py-2.5 normal-case shadow-none transition-transform hover:-translate-y-0.5"
      sx={{
        backgroundColor: `${colors.primary} !important`,
        color: '#ffffff !important',
        backgroundImage: 'none !important',
        boxShadow: 'none !important',
        '@media (hover: hover)': {
          '&:hover': {
            backgroundColor: `${colors.primaryDark} !important`,
            backgroundImage: 'none !important',
          },
        },
      }}
    >
      {loading ? (
        <CircularProgress size={22} color="inherit" aria-label="Loading" />
      ) : (
        label
      )}
    </Button>
  );
}
