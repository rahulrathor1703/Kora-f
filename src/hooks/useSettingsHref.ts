'use client';

import { useOrgPath } from '@/hooks/useOrgPath';

export function useSettingsHref(href: string): string {
  const toOrgPath = useOrgPath();

  if (href.startsWith('/settings') || href.startsWith('/email') || href.startsWith('/crm')) {
    return toOrgPath(href);
  }

  return href;
}
