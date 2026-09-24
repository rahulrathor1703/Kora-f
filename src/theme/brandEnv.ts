import type { ThemeMode } from './types';

export interface ModeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  foreground: string;
  background: string;
  surface: string;
}

const DEFAULT_COLORS: Record<ThemeMode, ModeColors> = {
  light: {
    primary: '#4338CA',
    primaryDark: '#3730A3',
    primaryLight: '#6366F1',
    secondary: '#475569',
    accent: '#7C3AED',
    foreground: '#0F172A',
    background: '#F8FAFC',
    surface: '#FFFFFF',
  },
  dark: {
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryLight: '#A5B4FC',
    secondary: '#94A3B8',
    accent: '#A78BFA',
    foreground: '#F8FAFC',
    background: '#0F172A',
    surface: '#1E293B',
  },
};

function readEnvColor(mode: ThemeMode, token: keyof ModeColors): string {
  const envKey = `NEXT_PUBLIC_THEME_${mode.toUpperCase()}_${token
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()}`;
  const value = process.env[envKey];

  if (value && /^#[0-9A-Fa-f]{3,8}$/.test(value)) {
    return value;
  }

  return DEFAULT_COLORS[mode][token];
}

export function getBrandColorsFromEnv(): Record<ThemeMode, ModeColors> {
  return {
    light: {
      primary: readEnvColor('light', 'primary'),
      primaryDark: readEnvColor('light', 'primaryDark'),
      primaryLight: readEnvColor('light', 'primaryLight'),
      secondary: readEnvColor('light', 'secondary'),
      accent: readEnvColor('light', 'accent'),
      foreground: readEnvColor('light', 'foreground'),
      background: readEnvColor('light', 'background'),
      surface: readEnvColor('light', 'surface'),
    },
    dark: {
      primary: readEnvColor('dark', 'primary'),
      primaryDark: readEnvColor('dark', 'primaryDark'),
      primaryLight: readEnvColor('dark', 'primaryLight'),
      secondary: readEnvColor('dark', 'secondary'),
      accent: readEnvColor('dark', 'accent'),
      foreground: readEnvColor('dark', 'foreground'),
      background: readEnvColor('dark', 'background'),
      surface: readEnvColor('dark', 'surface'),
    },
  };
}

import { env } from '@/config/env';

export function getBrandNameFromEnv(): string {
  return env.brandName;
}

export function getLoginHeroImageFromEnv(): string {
  return env.loginHeroImage;
}
