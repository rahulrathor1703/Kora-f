import type { ProspectSearchResult } from '@/lib/crm/prospects/types';

export const PROSPECT_CREATE_OPTION_ID = '__create__';

export interface ProspectCreateOption {
  kind: 'create';
  id: typeof PROSPECT_CREATE_OPTION_ID;
  displayName: string;
}

export type ProspectAutocompleteOption = ProspectSearchResult | ProspectCreateOption;

export function isProspectCreateOption(
  option: ProspectAutocompleteOption,
): option is ProspectCreateOption {
  return option.id === PROSPECT_CREATE_OPTION_ID && 'kind' in option;
}

export function getProspectAutocompleteOptionLabel(
  option: ProspectAutocompleteOption,
): string {
  if (isProspectCreateOption(option)) {
    return option.displayName;
  }

  if (option.email.trim()) {
    return `${option.fullName} (${option.email})`;
  }

  return option.fullName;
}

export function hasExactProspectLabelMatch(
  prospects: ProspectSearchResult[],
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return prospects.some(
    (prospect) => prospect.fullName.trim().toLowerCase() === normalized,
  );
}

export function shouldShowProspectCreateOption(input: {
  canCreateProspect: boolean;
  trimmedQuery: string;
  prospects: ProspectSearchResult[];
  minSearchLength: number;
}): boolean {
  const { canCreateProspect, trimmedQuery, prospects, minSearchLength } = input;

  if (!canCreateProspect) {
    return false;
  }

  if (trimmedQuery.length < minSearchLength) {
    return false;
  }

  return !hasExactProspectLabelMatch(prospects, trimmedQuery);
}

export function buildProspectCreateOption(displayName: string): ProspectCreateOption {
  return {
    kind: 'create',
    id: PROSPECT_CREATE_OPTION_ID,
    displayName: displayName.trim(),
  };
}

export function appendProspectCreateOptionIfNeeded(
  prospects: ProspectSearchResult[],
  input: {
    canCreateProspect: boolean;
    trimmedQuery: string;
    minSearchLength: number;
  },
): ProspectAutocompleteOption[] {
  if (
    !shouldShowProspectCreateOption({
      ...input,
      prospects,
    })
  ) {
    return prospects;
  }

  return [...prospects, buildProspectCreateOption(input.trimmedQuery)];
}
