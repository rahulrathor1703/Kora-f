'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';
import { useThemeMode } from '@/theme/ThemeModeProvider';

interface SocialOAuthButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  provider: 'google' | 'apple';
}

export default function SocialOAuthButton({
  label,
  icon,
  onClick,
  loading = false,
  disabled = false,
  provider,
}: SocialOAuthButtonProps) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Button
      type="button"
      variant="outlined"
      fullWidth
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={
        loading ? (
          <CircularProgress size={18} color="inherit" aria-label="Loading" />
        ) : (
          icon
        )
      }
      className="social-oauth-button rounded-xl normal-case shadow-none transition-transform hover:-translate-y-0.5"
      sx={{
        justifyContent: 'center',
        gap: 1,
        py: 1.35,
        px: 2,
        minHeight: 48,
        fontWeight: 600,
        fontSize: '0.9375rem',
        letterSpacing: '-0.01em',
        borderColor: 'var(--surface-border)',
        color: 'var(--foreground)',
        backgroundColor: isDark
          ? 'color-mix(in srgb, var(--surface) 92%, white 8%)'
          : 'var(--surface)',
        boxShadow: '0 1px 2px color-mix(in srgb, var(--foreground) 4%, transparent)',
        '@media (hover: hover)': {
          '&:hover': {
            borderColor:
              provider === 'google'
                ? 'color-mix(in srgb, #4285F4 35%, var(--surface-border))'
                : 'color-mix(in srgb, var(--foreground) 22%, var(--surface-border))',
            backgroundColor:
              provider === 'google'
                ? isDark
                  ? 'color-mix(in srgb, #4285F4 12%, var(--surface))'
                  : 'color-mix(in srgb, #4285F4 6%, var(--surface))'
                : isDark
                  ? 'color-mix(in srgb, var(--foreground) 8%, var(--surface))'
                  : 'color-mix(in srgb, var(--foreground) 4%, var(--surface))',
          },
        },
        '& .MuiButton-startIcon': {
          marginRight: 1,
          marginLeft: 0,
        },
      }}
    >
      {loading ? 'Connecting…' : label}
    </Button>
  );
}
