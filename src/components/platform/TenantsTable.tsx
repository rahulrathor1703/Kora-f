'use client';

import { useCallback, useState } from 'react';
import { listTenants, type TenantListItem } from '@/lib/api/platform';

type LoadState = 'loading' | 'ready' | 'error';

export function useTenantsRegistry(
  initialTenants: TenantListItem[],
  initialErrorMessage: string | null,
) {
  const [tenants, setTenants] = useState(initialTenants);
  const [loadState, setLoadState] = useState<LoadState>(
    initialErrorMessage ? 'error' : 'ready',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialErrorMessage,
  );

  const loadTenants = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const response = await listTenants();
      setTenants(response.tenants);
      setLoadState('ready');
    } catch (error) {
      setLoadState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to load organizations',
      );
    }
  }, []);

  return { tenants, loadState, errorMessage, loadTenants };
}
