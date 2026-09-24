import {
  buildEmptyProspectCompanySectionValues,
  buildProspectPrefillFromCompany,
} from '@/lib/crm/prospects/prospect-company-prefill.util';
import { PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY } from '@/lib/crm/prospects/prospect-lead-type-fields.util';
import type { Company } from '@/lib/crm/companies/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

const COMPANY_SECTION_ID = 'company-section-id';

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

const layoutFields: ProspectFieldDefinition[] = [
  field({ key: 'firstName', sectionId: 'other-section' }),
  field({
    id: COMPANY_SECTION_ID,
    key: PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY,
    type: 'section',
  }),
  field({ key: 'company', sectionId: COMPANY_SECTION_ID }),
  field({ key: 'companyType', type: 'select', sectionId: COMPANY_SECTION_ID }),
  field({ key: 'companyId', sectionId: COMPANY_SECTION_ID }),
  field({ key: 'createdDate', type: 'date', sectionId: COMPANY_SECTION_ID }),
  field({ key: 'city', sectionId: COMPANY_SECTION_ID }),
];

const company: Company = {
  id: 'co-1',
  brokerName: 'Acme Brokers',
  values: {
    companyType: 'broker',
    city: 'Mumbai',
    companyId: 'SYS-999',
    createdDate: '2024-01-01',
  },
  createdAt: '',
  updatedAt: '',
};

describe('buildProspectPrefillFromCompany', () => {
  it('maps brokerName to company and copies shared keys in company section', () => {
    expect(buildProspectPrefillFromCompany(company, layoutFields)).toEqual({
      company: 'Acme Brokers',
      companyType: 'broker',
      city: 'Mumbai',
    });
  });

  it('does not include fields outside company details section', () => {
    const patch = buildProspectPrefillFromCompany(company, layoutFields);
    expect(patch).not.toHaveProperty('firstName');
  });
});

describe('buildEmptyProspectCompanySectionValues', () => {
  it('clears company section field values', () => {
    expect(buildEmptyProspectCompanySectionValues(layoutFields)).toEqual({
      company: null,
      companyType: null,
      companyId: null,
      createdDate: null,
      city: null,
    });
  });
});
