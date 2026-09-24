export const PROSPECT_BANT_COMPUTED_FIELD_KEYS = ['score', 'bantTier'] as const;

export const PROSPECT_LEAD_SCORE_FIELD_KEY = 'score';
export const PROSPECT_BANT_TIER_FIELD_KEY = 'bantTier';

export type ProspectBantComputedFieldKey =
  (typeof PROSPECT_BANT_COMPUTED_FIELD_KEYS)[number];

const BANT_COMPUTED_KEY_SET = new Set<string>(
  PROSPECT_BANT_COMPUTED_FIELD_KEYS,
);

export function isProspectBantComputedFieldKey(key: string): boolean {
  return BANT_COMPUTED_KEY_SET.has(key);
}

export function isProspectBantComputedField(field: { key: string }): boolean {
  return isProspectBantComputedFieldKey(field.key);
}
