import {
  getProspectOverviewDataFields,
  getProspectOverviewLayoutFields,
  getProspectOverviewFooterFields,
  getProspectOverviewSummaryFields,
  isProspectFieldEditableOnDetail,
  PROSPECT_DETAIL_READ_ONLY_FIELD_KEYS,
} from '@/lib/crm/prospects/prospect-detail-fields.util';
import { PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY } from '@/lib/crm/prospects/prospect-lead-type-fields.util';
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

describe('getProspectOverviewLayoutFields', () => {
  it('includes create-form layout fields and org custom fields with sectionId', () => {
    const fields = [
      field({
        key: 'fullName',
        system: true,
        showInForm: false,
        sortOrder: 0,
      }),
      field({
        key: 'section_basic',
        type: 'section',
        showInForm: true,
        sortOrder: 1,
      }),
      field({
        key: 'firstName',
        sectionId: 'section-basic',
        showInForm: true,
        sortOrder: 2,
      }),
      field({
        key: 'vendor_code',
        sectionId: 'section-basic',
        showInForm: true,
        source: 'org',
        sortOrder: 3,
      }),
      field({
        key: 'crmStatus',
        type: 'select',
        showInForm: false,
        sortOrder: 4,
      }),
    ];

    const layout = getProspectOverviewLayoutFields(fields, {
      leadType: 'company',
    });

    expect(layout.map((item) => item.key)).toEqual([
      'section_basic',
      'firstName',
      'vendor_code',
    ]);
  });

  it('hides company details section for individual lead type', () => {
    const companySectionId = 'company-section-id';
    const fields = [
      field({
        id: companySectionId,
        key: PROSPECT_COMPANY_DETAILS_SECTION_FIELD_KEY,
        type: 'section',
        showInForm: true,
        sortOrder: 0,
      }),
      field({
        key: 'company',
        sectionId: companySectionId,
        showInForm: true,
        sortOrder: 1,
      }),
      field({
        key: 'section_basic',
        type: 'section',
        showInForm: true,
        sortOrder: 2,
      }),
      field({
        key: 'firstName',
        sectionId: 'section-basic',
        showInForm: true,
        sortOrder: 3,
      }),
    ];

    const layout = getProspectOverviewLayoutFields(fields, {
      leadType: 'individual',
    });

    expect(layout.map((item) => item.key)).toEqual(['section_basic', 'firstName']);
  });
});

describe('getProspectOverviewSummaryFields', () => {
  it('returns no fields (top metrics strip removed)', () => {
    const fields = [
      field({
        key: 'score',
        type: 'number',
        showInForm: false,
        showInTable: true,
      }),
    ];

    expect(getProspectOverviewSummaryFields(fields)).toEqual([]);
  });
});

describe('getProspectOverviewFooterFields', () => {
  it('includes lead score below the form when not on the create layout', () => {
    const fields = [
      field({
        key: 'emailStatus',
        type: 'select',
        showInForm: false,
        showInTable: true,
        sortOrder: 0,
      }),
      field({
        key: 'score',
        type: 'number',
        showInForm: false,
        showInTable: true,
        sortOrder: 1,
      }),
      field({
        key: 'firstName',
        sectionId: 'section-basic',
        showInForm: true,
        showInTable: true,
        sortOrder: 2,
      }),
    ];

    expect(getProspectOverviewFooterFields(fields).map((item) => item.key)).toEqual([
      'score',
    ]);
  });

  it('omits score from footer when score is on the form layout', () => {
    const fields = [
      field({
        key: 'section_basic',
        type: 'section',
        showInForm: true,
        sortOrder: 0,
      }),
      field({
        key: 'score',
        type: 'number',
        sectionId: 'section-basic',
        showInForm: true,
        showInTable: true,
        sortOrder: 1,
      }),
    ];

    const layout = getProspectOverviewLayoutFields(fields, { leadType: 'company' });

    expect(getProspectOverviewFooterFields(fields, layout).map((item) => item.key)).toEqual(
      [],
    );
  });
});

describe('isProspectFieldEditableOnDetail', () => {
  it('allows layout fields and crmStatus', () => {
    expect(
      isProspectFieldEditableOnDetail(
        field({
          key: 'firstName',
          sectionId: 'section-basic',
          showInForm: true,
        }),
      ),
    ).toBe(true);

    expect(
      isProspectFieldEditableOnDetail(
        field({
          key: 'crmStatus',
          type: 'select',
          showInForm: false,
          editableOnDetail: true,
        }),
      ),
    ).toBe(true);
  });

  it('blocks read-only metrics and internal keys', () => {
    for (const key of ['score', 'emailStatus', 'leadId']) {
      expect(
        isProspectFieldEditableOnDetail(
          field({
            key,
            showInForm: false,
            showInTable: true,
          }),
        ),
      ).toBe(false);
    }

    expect(PROSPECT_DETAIL_READ_ONLY_FIELD_KEYS.has('score')).toBe(true);
  });
});

describe('getProspectOverviewDataFields', () => {
  it('strips section headers', () => {
    const layout = [
      field({ key: 'section_basic', type: 'section', sortOrder: 0 }),
      field({
        key: 'firstName',
        sectionId: 'section-basic',
        sortOrder: 1,
      }),
    ];

    expect(getProspectOverviewDataFields(layout).map((item) => item.key)).toEqual([
      'firstName',
    ]);
  });
});
