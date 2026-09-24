'use client';

import { useOptionalOrgSlug } from '@/contexts/org-slug';
import { orgPath } from '@/lib/org-path';

export function useSettingsHref(href: string): string {
  const orgSlug = useOptionalOrgSlug();

  if (
    orgSlug &&
    (href.startsWith('/settings') ||
      href.startsWith('/email') ||
      href.startsWith('/crm'))
  ) {
    return orgPath(orgSlug, href);
  }

  return href;
}
