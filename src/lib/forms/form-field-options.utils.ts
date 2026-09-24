import type { FormFieldOption } from '@/lib/forms/types';

export const DEFAULT_FORM_FIELD_OPTION_COLOR = '#64748b';

export function slugifyFormFieldOptionValue(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

export function createEmptyFormFieldOption(): FormFieldOption {
  return { value: '', label: '', color: DEFAULT_FORM_FIELD_OPTION_COLOR };
}

export function resolveFormFieldOptionColor(color: string | undefined): string {
  return normalizeFormFieldOptionColor(color) ?? DEFAULT_FORM_FIELD_OPTION_COLOR;
}

export function normalizeFormFieldOptionColor(color: string | undefined): string | undefined {
  const trimmed = color?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed;
}

export function normalizeFormFieldOptions(
  options: FormFieldOption[] | undefined,
): FormFieldOption[] {
  if (!options) {
    return [];
  }

  return options
    .map((option) => ({
      value: option.value.trim(),
      label: option.label.trim(),
      color: normalizeFormFieldOptionColor(option.color),
    }))
    .filter((option) => option.value && option.label);
}

export function areFormFieldOptionsValid(options: FormFieldOption[]): boolean {
  return normalizeFormFieldOptions(options).length > 0;
}

export function shouldDisplayProspectOptionsAsChips(field: {
  type: string;
  displayOptionsAsChips?: boolean;
}): boolean {
  if (field.displayOptionsAsChips !== undefined) {
    return field.displayOptionsAsChips;
  }

  return field.type === 'select' || field.type === 'multiselect';
}

export function shouldDisplayCompanyOptionsAsChips(field: {
  type: string;
  displayOptionsAsChips?: boolean;
}): boolean {
  if (field.displayOptionsAsChips !== undefined) {
    return field.displayOptionsAsChips;
  }

  return false;
}

export function formFieldOptionChipSx(color: string | undefined) {
  const resolved = resolveFormFieldOptionColor(color);

  return {
    bgcolor: `${resolved}22`,
    color: resolved,
    border: `1px solid ${resolved}55`,
  };
}
