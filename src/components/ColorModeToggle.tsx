'use client';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useThemeMode } from '@/theme/ThemeModeProvider';

interface ColorModeToggleProps {
  size?: 'small' | 'medium';
  tone?: 'default' | 'onDark';
}

export default function ColorModeToggle({
  size = 'medium',
  tone = 'default',
}: ColorModeToggleProps) {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  const toneClassName =
    tone === 'onDark'
      ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
      : 'theme-toggle hover:scale-[1.03]';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleMode}
        size={size}
        className={`rounded-xl transition ${toneClassName}`}
      >
        {isDark ? (
          <LightModeOutlinedIcon fontSize={size} />
        ) : (
          <DarkModeOutlinedIcon fontSize={size} />
        )}
      </IconButton>
    </Tooltip>
  );
}
