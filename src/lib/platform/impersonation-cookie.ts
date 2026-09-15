export const VIEW_ORG_COOKIE_NAME = 'markos_view_org';

export interface ViewOrgCookie {
  organizationId: string;
  slug: string;
  name: string;
  status: 'active' | 'suspended';
}

export function serializeViewOrgCookie(organization: ViewOrgCookie): string {
  return encodeURIComponent(JSON.stringify(organization));
}

export function parseViewOrgCookie(value: string | undefined): ViewOrgCookie | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<ViewOrgCookie>;

    if (
      typeof parsed.organizationId !== 'string' ||
      typeof parsed.slug !== 'string' ||
      typeof parsed.name !== 'string' ||
      (parsed.status !== 'active' && parsed.status !== 'suspended')
    ) {
      return null;
    }

    return {
      organizationId: parsed.organizationId,
      slug: parsed.slug,
      name: parsed.name,
      status: parsed.status,
    };
  } catch {
    return null;
  }
}

export function getViewOrgCookieFromDocument(): ViewOrgCookie | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookiePrefix = `${VIEW_ORG_COOKIE_NAME}=`;
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(cookiePrefix));

  if (!match) {
    return null;
  }

  return parseViewOrgCookie(match.slice(cookiePrefix.length));
}

export function setViewOrgCookie(organization: ViewOrgCookie): void {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAgeSeconds = 60 * 60 * 8;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${VIEW_ORG_COOKIE_NAME}=${serializeViewOrgCookie(organization)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function clearViewOrgCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${VIEW_ORG_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getOrganizationContextHeaders(): Record<string, string> {
  const viewOrg = getViewOrgCookieFromDocument();

  if (!viewOrg) {
    return {};
  }

  return {
    'x-organization-id': viewOrg.organizationId,
  };
}
