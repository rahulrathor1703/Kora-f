import {
  getProspectTableFields,
  validateProspectFormValues,
} from '@/lib/crm/prospects/field-config';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

function field(
  partial: Partial<ProspectFieldDefinition> &
    Pick<ProspectFieldDefinition, 'key'>,
): ProspectFieldDefinition {
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

describe('getProspectTableFields', () => {
  it('matches Add Prospect form fields and excludes legacy system columns', () => {
    const fields = [
      field({
        key: 'fullName',
        label: 'Name',
        system: true,
        showInForm: false,
        sortOrder: 0,
      }),
      field({
        key: 'email',
        label: 'Email',
        type: 'email',
        system: true,
        showInForm: false,
        sortOrder: 1,
      }),
      field({
        key: 'leadStatus',
        label: 'Lead Status',
        type: 'select',
        showInForm: true,
        sortOrder: 2,
        options: [{ value: 'new', label: 'New' }],
      }),
      field({
        key: 'section_basic',
        type: 'section',
        showInForm: true,
        sortOrder: 3,
      }),
      field({
        key: 'firstName',
        label: 'First Name',
        sectionId: 'section-basic',
        showInForm: true,
        sortOrder: 4,
      }),
      field({
        key: 'vendor_code',
        label: 'Vendor Code',
        sectionId: 'section-basic',
        showInForm: true,
        source: 'org',
        sortOrder: 5,
      }),
    ];

    expect(getProspectTableFields(fields).map((item) => item.key)).toEqual([
      'firstName',
      'vendor_code',
    ]);
  });

  it('includes BANT lead score when not on the create form', () => {
    const fields = [
      field({
        key: 'firstName',
        sectionId: 'section-basic',
        showInForm: true,
        sortOrder: 1,
      }),
      field({
        key: 'score',
        label: 'Lead Score',
        type: 'number',
        showInForm: false,
        showInTable: true,
        sortOrder: 0,
      }),
    ];

    expect(getProspectTableFields(fields).map((item) => item.key)).toEqual([
      'score',
      'firstName',
    ]);
  });
});

describe('validateProspectFormValues', () => {
  it('rejects invalid select option values', () => {
    const fields = [
      field({
        key: 'leadStatus',
        type: 'select',
        required: true,
        options: [{ value: 'new', label: 'New' }],
      }),
    ];

    expect(
      validateProspectFormValues(fields, { leadStatus: 'invalid' }),
    ).toMatch(/Invalid value/);
  });

  it('rejects non-numeric number fields', () => {
    const fields = [field({ key: 'score', type: 'number', required: true })];

    expect(validateProspectFormValues(fields, { score: 'abc' })).toMatch(
      /must be a number/,
    );
  });

  it('enforces minLength from schema on text fields', () => {
    const fields = [
      field({ key: 'vendor_code', type: 'text', minLength: 5 }),
    ];

    expect(
      validateProspectFormValues(fields, { vendor_code: 'ab' }),
    ).toMatch(/at least 5 characters/);
  });
});
