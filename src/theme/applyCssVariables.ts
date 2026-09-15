import { getModeColors, surfaceBorderColor, withAlpha } from './colors';
import type { ThemeMode } from './types';

export function getThemeCssVariables(mode: ThemeMode): Record<string, string> {
  const active = getModeColors(mode);

  return {
    '--theme-primary': active.primary,
    '--theme-primary-dark': active.primaryDark,
    '--theme-primary-light': active.primaryLight,
    '--color-primary': active.primary,
    '--color-primary-dark': active.primaryDark,
    '--color-secondary': active.secondary,
    '--color-accent': active.accent,
    '--background': active.background,
    '--foreground': active.foreground,
    '--surface': active.surface,
    '--surface-border': surfaceBorderColor(mode),
    '--mesh-1': withAlpha(active.primary, 0.04),
  };
}

export function applyThemeCssVariables(mode: ThemeMode): void {
  const root = document.documentElement;
  const vars = getThemeCssVariables(mode);

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}
