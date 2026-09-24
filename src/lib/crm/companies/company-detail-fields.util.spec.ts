import {
  getCompanyOverviewLayoutFields,
  isCompanyFieldEditableOnDetail,
} from '@/lib/crm/companies/company-detail-fields.util';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';

function field(
  partial: Partial<CompanyFieldDefinition> &
    Pick<CompanyFieldDefinition, 'key'>,
): CompanyFieldDefinition {
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

describe('getCompanyOverviewLayoutFields', () => {
  it('includes sections and canvas-placed fields only', () => {
    const fields = [
      field({ key: 'section_a', type: 'section', sortOrder: 0 }),
      field({ key: 'brokerName', system: true, sortOrder: 1 }),
      field({ key: 'website', sectionId: 'section_a', sortOrder: 2 }),
      field({ key: 'orphan', sortOrder: 3 }),
    ];

    const layout = getCompanyOverviewLayoutFields(fields);

    expect(layout.map((item) => item.key)).toEqual(['section_a', 'website']);
  });
});

describe('isCompanyFieldEditableOnDetail', () => {
  it('allows canvas fields with default rules', () => {
    expect(
      isCompanyFieldEditableOnDetail(
        field({ key: 'website', sectionId: 'section_a' }),
      ),
    ).toBe(true);
  });

  it('blocks system and read-only metadata keys', () => {
    expect(
      isCompanyFieldEditableOnDetail(
        field({ key: 'brokerName', system: true, sectionId: 's' }),
      ),
    ).toBe(false);
    expect(
      isCompanyFieldEditableOnDetail(
        field({ key: 'createdDate', sectionId: 's', editableOnDetail: false }),
      ),
    ).toBe(false);
  });
});
