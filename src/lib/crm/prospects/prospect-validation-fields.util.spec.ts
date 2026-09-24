import {
  getProspectValidationFields,
  filterProspectLiveCreateFields,
} from '@/lib/crm/prospects/prospect-validation-fields.util';
import { PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY } from '@/lib/crm/prospects/prospect-lead-type-fields.util';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

const COMPANY_SECTION_ID = '00000000-0000-4000-8001-000000000002';
const BASIC_SECTION_ID = '00000000-0000-4000-8001-000000000001';

function field(
  partial: Partial<ProspectFieldDefinition> &
    Pick<ProspectFieldDefinition, 'key'>,
): ProspectFieldDefinition {
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

describe('getProspectValidationFields', () => {
  const schema = [
    field({ key: 'leadType', type: 'select', sectionId: BASIC_SECTION_ID }),
    field({
      id: COMPANY_SECTION_ID,
      key: PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY,
      type: 'section',
    }),
    field({
      key: 'company',
      required: true,
      sectionId: COMPANY_SECTION_ID,
    }),
    field({ key: 'firstName', required: true, sectionId: BASIC_SECTION_ID }),
    field({ key: 'score', type: 'number', sectionId: BASIC_SECTION_ID }),
  ];

  it('liveCreate mode applies lead type rules', () => {
    const applicable = getProspectValidationFields(
      schema,
      { leadType: 'individual' },
      { mode: 'liveCreate' },
    );

    expect(applicable.map((item) => item.key)).toEqual(['leadType', 'firstName']);
  });

  it('excludes BANT-computed fields from write validation', () => {
    const applicable = getProspectValidationFields(
      schema,
      { leadType: 'individual' },
      { mode: 'full' },
    );

    expect(applicable.map((item) => item.key)).not.toContain('score');
  });
});

describe('filterProspectLiveCreateFields', () => {
  it('excludes sections and system fields', () => {
    const fields = [
      field({ key: 'fullName', system: true, sectionId: BASIC_SECTION_ID }),
      field({ key: 'firstName', sectionId: BASIC_SECTION_ID }),
      field({ key: PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY, type: 'section' }),
    ];

    expect(filterProspectLiveCreateFields(fields).map((f) => f.key)).toEqual([
      'firstName',
    ]);
  });
});
