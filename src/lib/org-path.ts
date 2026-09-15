export const RESERVED_ORGANIZATION_SLUGS = new Set([
  'accept-invite',
  'admin',
  'api',
  'crm',
  'email',
  'health',
  'login',
  'platform',
  'settings',
  'signup',
  'website',
  'workspace',
]);

export function orgPath(slug: string, path = ''): string {
  const normalizedPath = path.startsWith('/') ? path : path ? `/${path}` : '';
  return `/${slug}${normalizedPath}`;
}

export function stripOrgPrefix(pathname: string, orgSlug: string): string {
  if (pathname === `/${orgSlug}`) {
    return '/';
  }

  if (pathname.startsWith(`/${orgSlug}/`)) {
    return pathname.slice(orgSlug.length + 1);
  }

  return pathname;
}

export function getOrgSlugFromPathname(pathname: string): string | null {
  const segment = pathname.split('/').filter(Boolean)[0];

  if (!segment || RESERVED_ORGANIZATION_SLUGS.has(segment)) {
    return null;
  }

  return segment;
}
