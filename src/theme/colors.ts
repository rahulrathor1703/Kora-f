import type { ThemeMode } from './types';
import { getBrandColorsFromEnv, type ModeColors } from './brandEnv';

export type { ModeColors };

export const themeColors: Record<ThemeMode, ModeColors> =
  getBrandColorsFromEnv();

export function getModeColors(mode: ThemeMode): ModeColors {
  return themeColors[mode];
}

function expandHex(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  return hex;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = expandHex(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function surfaceBorderColor(mode: ThemeMode): string {
  const { foreground } = getModeColors(mode);
  return withAlpha(foreground, mode === 'light' ? 0.08 : 0.12);
}

export function focusRing(mode: ThemeMode): string {
  const color = getModeColors(mode).primary;
  return `0 0 0 4px ${withAlpha(color, mode === 'light' ? 0.12 : 0.18)}`;
}

export function primaryButtonShadow(mode: ThemeMode): string {
  return `0 1px 2px ${withAlpha(getModeColors(mode).primary, 0.2)}`;
}
