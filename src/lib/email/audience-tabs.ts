export type AudienceHubTab = 'contacts' | 'lists' | 'excluded';

export const AUDIENCE_HUB_DEFAULT_TAB: AudienceHubTab = 'lists';

export const AUDIENCE_HUB_TAB_QUERY_KEY = 'tab';

export function parseAudienceHubTab(value: string | null): AudienceHubTab {
  if (value === 'contacts' || value === 'excluded') {
    return value;
  }

  return AUDIENCE_HUB_DEFAULT_TAB;
}

export function isAudienceHubListsTab(tab: AudienceHubTab): boolean {
  return tab === AUDIENCE_HUB_DEFAULT_TAB;
}

export function buildAudienceHubSearchParams(
  tab: AudienceHubTab,
  existingParams?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(existingParams?.toString());

  if (isAudienceHubListsTab(tab)) {
    params.delete(AUDIENCE_HUB_TAB_QUERY_KEY);
  } else {
    params.set(AUDIENCE_HUB_TAB_QUERY_KEY, tab);
  }

  return params;
}

export function buildAudienceHubHref(
  tab: AudienceHubTab,
  toOrgPath: (path: string) => string,
  existingParams?: URLSearchParams,
): string {
  const params = buildAudienceHubSearchParams(tab, existingParams);
  const query = params.toString();

  return toOrgPath(`/email/lists${query ? `?${query}` : ''}`);
}
