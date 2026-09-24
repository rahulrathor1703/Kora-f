'use client';

import { useCallback, useState } from 'react';
import { listAdmins, type AdminListItem } from '@/lib/api/platform';

type LoadState = 'loading' | 'ready' | 'error';

export function useAdminsRegistry(
  initialAdmins: AdminListItem[],
  initialErrorMessage: string | null,
) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [loadState, setLoadState] = useState<LoadState>(
    initialErrorMessage ? 'error' : 'ready',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialErrorMessage,
  );

  const loadAdmins = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const response = await listAdmins();
      setAdmins(response.admins);
      setLoadState('ready');
    } catch (error) {
      setLoadState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to load organizations',
      );
    }
  }, []);

  return { admins, loadState, errorMessage, loadAdmins };
}
