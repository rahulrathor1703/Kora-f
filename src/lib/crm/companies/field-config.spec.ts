import {
  validateCompanyFormValues,
  type CompanyDraftValues,
} from '@/lib/crm/companies/field-config';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';

function field(
  partial: Partial<CompanyFieldDefinition> &
    Pick<CompanyFieldDefinition, 'key'>,
): CompanyFieldDefinition {
  return {
    id: '00000000-0000-4000-8000-000000000099',
    label: partial.label ?? partial.key,
    type: partial.type ?? 'text',
    sortOrder: partial.sortOrder ?? 0,
    showInTable: partial.showInTable ?? true,
    showInForm: partial.showInForm ?? true,
    ...partial,
  };
}

function draft(
  partial: Partial<CompanyDraftValues> = {},
): CompanyDraftValues {
  return {
    brokerName: partial.brokerName ?? '',
    values: partial.values ?? {},
  };
}

describe('validateCompanyFormValues', () => {
  it('rejects invalid select option values', () => {
    const fields = [
      field({
        key: 'status',
        type: 'select',
        required: true,
        sectionId: 'section-1',
        options: [{ value: 'client', label: 'Client' }],
      }),
    ];

    expect(
      validateCompanyFormValues(fields, draft({ values: { status: 'invalid' } }), {
        mode: 'liveCreate',
      }),
    ).toMatch(/Invalid value/);
  });

  it('rejects non-numeric number fields', () => {
    const fields = [
      field({
        key: 'headcount',
        type: 'number',
        required: true,
        sectionId: 'section-1',
      }),
    ];

    expect(
      validateCompanyFormValues(
        fields,
        draft({ values: { headcount: 'abc' } }),
        { mode: 'liveCreate' },
      ),
    ).toMatch(/must be a number/);
  });

  it('enforces minLength from schema on tenant text fields', () => {
    const fields = [
      field({
        key: 'vendor_code',
        type: 'text',
        minLength: 5,
        sectionId: 'section-1',
      }),
    ];

    expect(
      validateCompanyFormValues(
        fields,
        draft({ values: { vendor_code: 'ab' } }),
        { mode: 'liveCreate' },
      ),
    ).toMatch(/at least 5 characters/);
  });

  it('requires tenant custom fields on the live create layout', () => {
    const fields = [
      field({
        key: 'custom_note',
        type: 'text',
        required: true,
        sectionId: 'section-1',
      }),
    ];

    expect(
      validateCompanyFormValues(fields, draft(), { mode: 'liveCreate' }),
    ).toMatch(/custom_note is required|Custom note is required/i);
  });

  it('validates off-canvas tenant fields in full mode', () => {
    const fields = [
      field({
        key: 'orphan_field',
        type: 'text',
        required: true,
        showInForm: true,
      }),
    ];

    expect(
      validateCompanyFormValues(fields, draft(), { mode: 'full' }),
    ).toMatch(/orphan_field is required|Orphan field is required/i);
  });
});
