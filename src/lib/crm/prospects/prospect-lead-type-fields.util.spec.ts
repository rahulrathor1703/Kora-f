import {
  filterProspectFieldsForLeadType,
  PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY,
} from '@/lib/crm/prospects/prospect-lead-type-fields.util';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

const COMPANY_SECTION_ID = '00000000-0000-4000-8001-000000000002';

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

describe('filterProspectFieldsForLeadType', () => {
  const fields = [
    field({ key: 'leadType', type: 'select' }),
    field({
      id: COMPANY_SECTION_ID,
      key: PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY,
      type: 'section',
    }),
    field({ key: 'company', required: true, sectionId: COMPANY_SECTION_ID }),
    field({ key: 'firstName', required: true }),
  ];

  it('hides company details when lead type is individual', () => {
    const visible = filterProspectFieldsForLeadType(fields, {
      leadType: 'individual',
    });

    expect(visible.map((item) => item.key)).toEqual(['leadType', 'firstName']);
  });

  it('shows company details when lead type is company', () => {
    const visible = filterProspectFieldsForLeadType(fields, {
      leadType: 'company',
    });

    expect(visible.map((item) => item.key)).toEqual([
      'leadType',
      PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY,
      'company',
      'firstName',
    ]);
  });
});
