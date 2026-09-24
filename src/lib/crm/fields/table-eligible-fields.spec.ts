import {
  getCrmListTableColumnFields,
  getCrmListTableDefaultColumnVisible,
  getCrmListTableEligibleFields,
} from '@/lib/crm/fields/table-eligible-fields';

describe('getCrmListTableColumnFields', () => {
  it('includes all non-section fields regardless of showInTable', () => {
    const fields = [
      {
        key: 'first_name',
        type: 'text',
        showInTable: true,
        showInForm: true,
      },
      {
        key: 'hidden',
        type: 'text',
        showInTable: false,
        showInForm: true,
      },
      {
        key: 'section_basic',
        type: 'section',
        showInTable: true,
        showInForm: true,
      },
      {
        key: 'legacy_name',
        type: 'text',
        showInTable: false,
        showInForm: false,
      },
    ];

    expect(getCrmListTableColumnFields(fields).map((field) => field.key)).toEqual([
      'first_name',
      'hidden',
      'legacy_name',
    ]);
  });
});

describe('getCrmListTableDefaultColumnVisible', () => {
  it('defaults all columns to visible before user customization', () => {
    expect(
      getCrmListTableDefaultColumnVisible({
        key: 'first_name',
        type: 'text',
        showInTable: false,
        source: 'platform',
      }),
    ).toBe(true);
  });
});

describe('getCrmListTableEligibleFields', () => {
  it('includes only non-section fields with showInTable true', () => {
    const fields = [
      {
        key: 'first_name',
        type: 'text',
        showInTable: true,
        showInForm: true,
      },
      {
        key: 'hidden',
        type: 'text',
        showInTable: false,
        showInForm: true,
      },
    ];

    expect(getCrmListTableEligibleFields(fields).map((field) => field.key)).toEqual([
      'first_name',
    ]);
  });
});
