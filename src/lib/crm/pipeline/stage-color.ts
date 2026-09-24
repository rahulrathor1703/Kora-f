const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{6})$/;

export const STAGE_COLOR_PRESETS = [
  '#64748b',
  '#3b82f6',
  '#06b6d4',
  '#8b5cf6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
] as const;

export const DEFAULT_STAGE_COLOR = STAGE_COLOR_PRESETS[0];

export function normalizeStageColor(value: string): string | null {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  if (!HEX_COLOR_PATTERN.test(withHash)) {
    return null;
  }

  return withHash.toLowerCase();
}

export function withAlpha(hex: string, alpha: number): string {
  const normalized = normalizeStageColor(hex) ?? DEFAULT_STAGE_COLOR;
  const value = normalized.slice(1);
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
