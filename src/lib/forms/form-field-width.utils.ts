import { FORM_GRID_COLUMNS } from '@/lib/crm/fields/form-layout.utils';

export const FORM_FIELD_ROW_WIDTH_PRESETS = [
  { id: 'xs', label: 'XS', percentLabel: '25%', colSpan: 3 },
  { id: 'sm', label: 'Small', percentLabel: '33%', colSpan: 4 },
  { id: 'md', label: 'Medium', percentLabel: '50%', colSpan: 6 },
  { id: 'lg', label: 'Large', percentLabel: '75%', colSpan: 9 },
  { id: 'full', label: 'Full', percentLabel: '100%', colSpan: 12 },
] as const;

export type FormFieldRowWidthPresetId =
  (typeof FORM_FIELD_ROW_WIDTH_PRESETS)[number]['id'];

export function colSpanToWidthPresetIndex(colSpan: number): number {
  const clamped = Math.min(FORM_GRID_COLUMNS, Math.max(1, colSpan));
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  FORM_FIELD_ROW_WIDTH_PRESETS.forEach((preset, index) => {
    const distance = Math.abs(preset.colSpan - clamped);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export function widthPresetIndexToColSpan(index: number): number {
  const preset =
    FORM_FIELD_ROW_WIDTH_PRESETS[index] ??
    FORM_FIELD_ROW_WIDTH_PRESETS[0];
  return preset.colSpan;
}

export function resolveWidthPresetFromColSpan(colSpan: number) {
  const index = colSpanToWidthPresetIndex(colSpan);
  return FORM_FIELD_ROW_WIDTH_PRESETS[index];
}
