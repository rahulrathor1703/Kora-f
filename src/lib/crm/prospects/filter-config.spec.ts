import { splitFilterableFields } from '@/lib/crm/prospects/filter-config';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

function field(
  partial: Partial<ProspectFieldDefinition> &
    Pick<ProspectFieldDefinition, 'key'>,
): ProspectFieldDefinition {
  return {
    id: '00000000-0000-4000-8000-000000000099',
    label: partial.label ?? partial.key,
    type: partial.type ?? 'select',
    sortOrder: partial.sortOrder ?? 0,
    showInTable: partial.showInTable ?? true,
    showInForm: partial.showInForm ?? true,
    filterable: partial.filterable ?? true,
    options: partial.options ?? [{ value: 'a', label: 'A' }],
    ...partial,
  };
}

describe('splitFilterableFields', () => {
  it('uses leadStatus as the sole primary filter when filterable', () => {
    const fields = [
      field({
        key: 'leadStatus',
        label: 'Lead Status',
        pipelineStage: true,
      }),
      field({ key: 'emailStatus', label: 'Email Status' }),
      field({ key: 'leadSource', label: 'Lead Source' }),
    ];

    const { primary, secondary } = splitFilterableFields(fields);

    expect(primary.map((item) => item.key)).toEqual(['leadStatus']);
    expect(secondary.map((item) => item.key)).toEqual(['leadSource']);
    expect(secondary.some((item) => item.key === 'emailStatus')).toBe(false);
  });

  it('never exposes emailStatus in primary or secondary', () => {
    const fields = [
      field({ key: 'leadStatus', label: 'Lead Status' }),
      field({ key: 'emailStatus', label: 'Email Status', filterable: true }),
    ];

    const { primary, secondary } = splitFilterableFields(fields);

    expect(primary.map((item) => item.key)).toEqual(['leadStatus']);
    expect(secondary.map((item) => item.key)).not.toContain('emailStatus');
  });

  it('falls back to pipeline stage when leadStatus is not filterable', () => {
    const fields = [
      field({
        key: 'customStage',
        label: 'Custom Stage',
        pipelineStage: true,
      }),
      field({
        key: 'leadStatus',
        label: 'Lead Status',
        filterable: false,
        type: 'select',
      }),
    ];

    const { primary, secondary } = splitFilterableFields(fields);

    expect(primary.map((item) => item.key)).toEqual(['customStage']);
    expect(secondary.map((item) => item.key)).toEqual([]);
  });

  it('includes other filterable fields in secondary', () => {
    const fields = [
      field({ key: 'leadStatus', label: 'Lead Status' }),
      field({ key: 'bantTier', label: 'BANT Tier' }),
      field({ key: 'leadType', label: 'Lead Type' }),
    ];

    const { primary, secondary } = splitFilterableFields(fields);

    expect(primary.map((item) => item.key)).toEqual(['leadStatus']);
    expect(secondary.map((item) => item.key)).toEqual(['bantTier', 'leadType']);
  });
});
