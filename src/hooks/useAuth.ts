'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useImpersonation } from '@/contexts/impersonation';
import { authService } from '@/lib/api';
import { invalidateQuery, useApiAction, useApiQuery } from '@/hooks/api';

export function useSession() {
  return useApiQuery('auth.session', () => authService.getSession());
}

/** Stable cache key segment so org-scoped data refetches when the active org changes. */
export function useOrgScopeKey(): string {
  const { data: session } = useSession();
  const { organization: impersonatedOrganization } = useImpersonation();

  return (
    impersonatedOrganization?.organizationId ??
    session?.organizationId ??
    session?.organization?.id ??
    'none'
  );
}

export function useLogout() {
  const router = useRouter();
  const { execute: logoutRequest, isLoading, error, reset } = useApiAction(() =>
    authService.logout(),
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      invalidateQuery('auth.session');
      router.push('/login');
      router.refresh();
    }
  }, [logoutRequest, router]);

  return { logout, isLoading, error, reset };
}
