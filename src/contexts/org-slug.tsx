'use client';

import { createContext, useContext } from 'react';

const OrgSlugContext = createContext<string | null>(null);

export function OrgSlugProvider({
  orgSlug,
  children,
}: {
  orgSlug: string;
  children: React.ReactNode;
}) {
  return (
    <OrgSlugContext.Provider value={orgSlug}>{children}</OrgSlugContext.Provider>
  );
}

export function useOrgSlug(): string {
  const slug = useContext(OrgSlugContext);

  if (!slug) {
    throw new Error('useOrgSlug must be used within OrgSlugProvider');
  }

  return slug;
}

export function useOptionalOrgSlug(): string | null {
  return useContext(OrgSlugContext);
}
