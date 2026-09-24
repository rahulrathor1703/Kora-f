import {
  filterFieldsForLayoutCanvas,
  getFieldsForLiveCreateForm,
} from '@/lib/forms/layout-canvas-fields.utils';
import {
  CRM_COMPANY_CREATE_FORM_KEY,
  CRM_PROSPECT_CREATE_FORM_KEY,
} from '@/lib/forms/crm-form-keys';
import type { FormFieldDefinition } from '@/lib/forms/types';

function field(
  partial: Partial<FormFieldDefinition> & Pick<FormFieldDefinition, 'key'>,
): FormFieldDefinition {
  return {
    id: partial.id ?? '00000000-0000-4000-8000-000000000099',
    label: partial.label ?? partial.key,
    type: partial.type ?? 'text',
    sortOrder: partial.sortOrder ?? 0,
    showInTable: partial.showInTable ?? true,
    showInForm: partial.showInForm ?? true,
    ...partial,
  };
}

describe('filterFieldsForLayoutCanvas', () => {
  it('filters prospect and company create forms the same way', () => {
    const fields = [
      field({ key: 'section_a', type: 'section' }),
      field({ key: 'brokerName', system: true, sectionId: 'section_a' }),
      field({ key: 'fullName', system: true, sectionId: 'section_a' }),
      field({ key: 'website', sectionId: 'section_a' }),
      field({ key: 'orphan' }),
    ];

    expect(
      filterFieldsForLayoutCanvas(CRM_COMPANY_CREATE_FORM_KEY, fields).map(
        (item) => item.key,
      ),
    ).toEqual(['section_a', 'brokerName', 'website']);

    expect(
      filterFieldsForLayoutCanvas(CRM_PROSPECT_CREATE_FORM_KEY, fields).map(
        (item) => item.key,
      ),
    ).toEqual(['section_a', 'website']);
  });

  it('returns all fields for unrelated form keys', () => {
    const fields = [field({ key: 'a' }), field({ key: 'b' })];
    expect(filterFieldsForLayoutCanvas('email.list.contact.add', fields)).toBe(
      fields,
    );
  });
});

describe('getFieldsForLiveCreateForm', () => {
  it('includes sections and canvas fields sorted by sortOrder', () => {
    const fields = [
      field({ key: 'section_b', type: 'section', sortOrder: 2 }),
      field({ key: 'z_field', sectionId: 's', sortOrder: 3 }),
      field({ key: 'section_a', type: 'section', sortOrder: 0 }),
      field({ key: 'a_field', sectionId: 's', sortOrder: 1 }),
    ];

    const live = getFieldsForLiveCreateForm(
      CRM_COMPANY_CREATE_FORM_KEY,
      fields,
    );

    expect(live.map((item) => item.key)).toEqual([
      'section_a',
      'a_field',
      'section_b',
      'z_field',
    ]);
  });
});
