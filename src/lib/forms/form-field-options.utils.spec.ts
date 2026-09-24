import {
  DEFAULT_FORM_FIELD_OPTION_COLOR,
  formFieldOptionChipSx,
  resolveFormFieldOptionColor,
} from '@/lib/forms/form-field-options.utils';

describe('resolveFormFieldOptionColor', () => {
  it('returns default for empty or whitespace color', () => {
    expect(resolveFormFieldOptionColor(undefined)).toBe(
      DEFAULT_FORM_FIELD_OPTION_COLOR,
    );
    expect(resolveFormFieldOptionColor('')).toBe(DEFAULT_FORM_FIELD_OPTION_COLOR);
    expect(resolveFormFieldOptionColor('   ')).toBe(
      DEFAULT_FORM_FIELD_OPTION_COLOR,
    );
  });

  it('preserves valid hex color', () => {
    expect(resolveFormFieldOptionColor('#3b82f6')).toBe('#3b82f6');
    expect(resolveFormFieldOptionColor('  #22c55e  ')).toBe('#22c55e');
  });
});

describe('formFieldOptionChipSx', () => {
  it('uses default tint when color is missing', () => {
    expect(formFieldOptionChipSx(undefined)).toEqual({
      bgcolor: `${DEFAULT_FORM_FIELD_OPTION_COLOR}22`,
      color: DEFAULT_FORM_FIELD_OPTION_COLOR,
      border: `1px solid ${DEFAULT_FORM_FIELD_OPTION_COLOR}55`,
    });
  });

  it('uses provided color when set', () => {
    expect(formFieldOptionChipSx('#ef4444')).toEqual({
      bgcolor: '#ef444422',
      color: '#ef4444',
      border: '1px solid #ef444455',
    });
  });
});
