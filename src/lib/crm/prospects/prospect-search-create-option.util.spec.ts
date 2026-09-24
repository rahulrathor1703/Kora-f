import {
  appendProspectCreateOptionIfNeeded,
  hasExactProspectLabelMatch,
  isProspectCreateOption,
  shouldShowProspectCreateOption,
} from '@/lib/crm/prospects/prospect-search-create-option.util';
import type { ProspectSearchResult } from '@/lib/crm/prospects/types';

const MIN = 2;

function prospect(fullName: string, email = ''): ProspectSearchResult {
  return { id: `id-${fullName}`, fullName, email };
}

describe('hasExactProspectLabelMatch', () => {
  it('matches full name case-insensitively', () => {
    expect(hasExactProspectLabelMatch([prospect('Jane Doe')], 'jane doe')).toBe(
      true,
    );
  });
});

describe('shouldShowProspectCreateOption', () => {
  it('shows when allowed and no exact match', () => {
    expect(
      shouldShowProspectCreateOption({
        canCreateProspect: true,
        trimmedQuery: 'New Person',
        prospects: [prospect('Other')],
        minSearchLength: MIN,
      }),
    ).toBe(true);
  });

  it('hides without create permission', () => {
    expect(
      shouldShowProspectCreateOption({
        canCreateProspect: false,
        trimmedQuery: 'New Person',
        prospects: [],
        minSearchLength: MIN,
      }),
    ).toBe(false);
  });
});

describe('appendProspectCreateOptionIfNeeded', () => {
  it('appends create option', () => {
    const options = appendProspectCreateOptionIfNeeded([], {
      canCreateProspect: true,
      trimmedQuery: 'Paraksh',
      minSearchLength: MIN,
    });

    expect(options).toHaveLength(1);
    expect(isProspectCreateOption(options[0]!)).toBe(true);
  });
});
