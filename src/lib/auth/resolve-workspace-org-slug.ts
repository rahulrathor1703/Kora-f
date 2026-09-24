import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { AuthUser } from '@/lib/api/auth';
import {
  parseViewOrgCookie,
  VIEW_ORG_COOKIE_NAME,
} from '@/lib/platform/impersonation-cookie';

export function resolveWorkspaceOrgSlug(
  session: AuthUser | null,
  cookieStore: ReadonlyRequestCookies,
): string | null {
  if (!session) {
    return null;
  }

  if (session.role === 'superadmin') {
    const viewOrg = parseViewOrgCookie(
      cookieStore.get(VIEW_ORG_COOKIE_NAME)?.value,
    );

    return viewOrg?.slug ?? null;
  }

  if (session.role === 'admin') {
    return session.organization?.slug ?? null;
  }

  return null;
}
