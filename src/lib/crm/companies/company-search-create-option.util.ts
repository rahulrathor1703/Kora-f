import { getCompanyPickerLabel } from '@/lib/crm/companies/company-picker-label.util';
import type { Company } from '@/lib/crm/companies/types';

export const COMPANY_CREATE_OPTION_ID = '__create__';

export interface CompanyCreateOption {
  kind: 'create';
  id: typeof COMPANY_CREATE_OPTION_ID;
  brokerName: string;
}

export type CompanyAutocompleteOption = Company | CompanyCreateOption;

export function isCompanyCreateOption(
  option: CompanyAutocompleteOption,
): option is CompanyCreateOption {
  return option.id === COMPANY_CREATE_OPTION_ID && 'kind' in option;
}

export function hasExactCompanyLabelMatch(
  companies: Company[],
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return companies.some(
    (company) => getCompanyPickerLabel(company).trim().toLowerCase() === normalized,
  );
}

export function shouldShowCompanyCreateOption(input: {
  canCreateCompany: boolean;
  trimmedQuery: string;
  companies: Company[];
  minSearchLength: number;
}): boolean {
  const { canCreateCompany, trimmedQuery, companies, minSearchLength } = input;

  if (!canCreateCompany) {
    return false;
  }

  if (trimmedQuery.length < minSearchLength) {
    return false;
  }

  return !hasExactCompanyLabelMatch(companies, trimmedQuery);
}

export function buildCompanyCreateOption(brokerName: string): CompanyCreateOption {
  return {
    kind: 'create',
    id: COMPANY_CREATE_OPTION_ID,
    brokerName: brokerName.trim(),
  };
}

export function appendCompanyCreateOptionIfNeeded(
  companies: Company[],
  input: {
    canCreateCompany: boolean;
    trimmedQuery: string;
    minSearchLength: number;
  },
): CompanyAutocompleteOption[] {
  if (
    !shouldShowCompanyCreateOption({
      ...input,
      companies,
    })
  ) {
    return companies;
  }

  return [...companies, buildCompanyCreateOption(input.trimmedQuery)];
}

export function getCompanyAutocompleteOptionLabel(
  option: CompanyAutocompleteOption,
): string {
  if (isCompanyCreateOption(option)) {
    return option.brokerName;
  }

  return getCompanyPickerLabel(option);
}
