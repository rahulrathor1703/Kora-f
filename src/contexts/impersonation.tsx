'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { clearViewOrgCookie, type ViewOrgCookie } from '@/lib/platform/impersonation-cookie';
import { stopImpersonation } from '@/lib/api/platform';

interface ImpersonationContextValue {
  organization: ViewOrgCookie | null;
  isImpersonating: boolean;
  exitImpersonation: () => Promise<void>;
}

const ImpersonationContext = createContext<ImpersonationContextValue>({
  organization: null,
  isImpersonating: false,
  exitImpersonation: async () => {},
});

export function ImpersonationProvider({
  organization,
  children,
}: {
  organization: ViewOrgCookie | null;
  children: ReactNode;
}) {
  const router = useRouter();

  const exitImpersonation = useCallback(async () => {
    try {
      await stopImpersonation(organization?.organizationId);
    } finally {
      clearViewOrgCookie();
      router.push('/platform/tenants');
      router.refresh();
    }
  }, [organization?.organizationId, router]);

  const value = useMemo(
    () => ({
      organization,
      isImpersonating: organization !== null,
      exitImpersonation,
    }),
    [organization, exitImpersonation],
  );

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation(): ImpersonationContextValue {
  return useContext(ImpersonationContext);
}

export function useActiveOrganization(): ViewOrgCookie | null {
  const { organization: impersonatedOrganization } = useImpersonation();
  return impersonatedOrganization;
}
