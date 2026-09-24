import {
  isProspectBantComputedField,
  isProspectBantComputedFieldKey,
  PROSPECT_BANT_COMPUTED_FIELD_KEYS,
} from '@/lib/crm/prospects/prospect-bant-computed-fields.util';

describe('prospect-bant-computed-fields.util', () => {
  it('lists score and bantTier as computed keys', () => {
    expect(PROSPECT_BANT_COMPUTED_FIELD_KEYS).toEqual(['score', 'bantTier']);
  });

  it('identifies BANT-computed field keys', () => {
    expect(isProspectBantComputedFieldKey('score')).toBe(true);
    expect(isProspectBantComputedFieldKey('bantTier')).toBe(true);
    expect(isProspectBantComputedFieldKey('fullName')).toBe(false);
  });

  it('identifies BANT-computed fields by key', () => {
    expect(isProspectBantComputedField({ key: 'bantTier' })).toBe(true);
    expect(isProspectBantComputedField({ key: 'email' })).toBe(false);
  });
});
