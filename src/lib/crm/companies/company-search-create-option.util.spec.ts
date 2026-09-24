import {
  appendCompanyCreateOptionIfNeeded,
  buildCompanyCreateOption,
  hasExactCompanyLabelMatch,
  isCompanyCreateOption,
  shouldShowCompanyCreateOption,
} from '@/lib/crm/companies/company-search-create-option.util';
import type { Company } from '@/lib/crm/companies/types';

const MIN = 2;

function company(brokerName: string): Company {
  return {
    id: `id-${brokerName}`,
    brokerName,
    values: {},
    createdAt: '',
    updatedAt: '',
  };
}

describe('hasExactCompanyLabelMatch', () => {
  it('matches broker name case-insensitively', () => {
    expect(hasExactCompanyLabelMatch([company('Acme Brokers')], 'acme brokers')).toBe(
      true,
    );
  });

  it('returns false when only partial match exists', () => {
    expect(hasExactCompanyLabelMatch([company('Acme Brokers')], 'Acme')).toBe(false);
  });
});

describe('shouldShowCompanyCreateOption', () => {
  it('shows when user can create, query is long enough, and no exact match', () => {
    expect(
      shouldShowCompanyCreateOption({
        canCreateCompany: true,
        trimmedQuery: 'New Co',
        companies: [company('Acme')],
        minSearchLength: MIN,
      }),
    ).toBe(true);
  });

  it('hides without create permission', () => {
    expect(
      shouldShowCompanyCreateOption({
        canCreateCompany: false,
        trimmedQuery: 'New Co',
        companies: [],
        minSearchLength: MIN,
      }),
    ).toBe(false);
  });

  it('hides when query is shorter than minimum', () => {
    expect(
      shouldShowCompanyCreateOption({
        canCreateCompany: true,
        trimmedQuery: 'A',
        companies: [],
        minSearchLength: MIN,
      }),
    ).toBe(false);
  });

  it('hides when an exact label match exists', () => {
    expect(
      shouldShowCompanyCreateOption({
        canCreateCompany: true,
        trimmedQuery: 'Acme Brokers',
        companies: [company('Acme Brokers')],
        minSearchLength: MIN,
      }),
    ).toBe(false);
  });
});

describe('appendCompanyCreateOptionIfNeeded', () => {
  it('appends a create sentinel option', () => {
    const options = appendCompanyCreateOptionIfNeeded([], {
      canCreateCompany: true,
      trimmedQuery: 'Fresh Inc',
      minSearchLength: MIN,
    });

    expect(options).toHaveLength(1);
    expect(isCompanyCreateOption(options[0]!)).toBe(true);
    if (isCompanyCreateOption(options[0]!)) {
      expect(options[0].brokerName).toBe('Fresh Inc');
    }
  });

  it('leaves list unchanged when create option should not show', () => {
    const items = [company('Acme')];
    const options = appendCompanyCreateOptionIfNeeded(items, {
      canCreateCompany: true,
      trimmedQuery: 'Acme',
      minSearchLength: MIN,
    });

    expect(options).toEqual(items);
  });
});

describe('buildCompanyCreateOption', () => {
  it('trims broker name', () => {
    expect(buildCompanyCreateOption('  Spaced  ').brokerName).toBe('Spaced');
  });
});
