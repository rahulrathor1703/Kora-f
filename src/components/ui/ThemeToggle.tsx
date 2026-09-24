'use client';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import IconButton from '@mui/material/IconButton';
import { useThemeMode } from '@/theme/ThemeModeProvider';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { toggleMode, mode } = useThemeMode();
  const nextMode = mode === 'light' ? 'dark' : 'light';

  return (
    <IconButton
      type="button"
      onClick={toggleMode}
      aria-label={`Switch to ${nextMode} mode`}
      className={`theme-toggle-icon ${className ?? ''}`}
      size="medium"
    >
      {mode === 'light' ? (
        <DarkModeOutlinedIcon fontSize="small" />
      ) : (
        <LightModeOutlinedIcon fontSize="small" />
      )}
    </IconButton>
  );
}
