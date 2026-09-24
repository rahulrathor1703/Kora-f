'use client';

import { orgPath } from '@/lib/org-path';
import { useOrgSlug } from '@/contexts/org-slug';

export function useOrgPath() {
  const orgSlug = useOrgSlug();

  return (path = '') => orgPath(orgSlug, path);
}
