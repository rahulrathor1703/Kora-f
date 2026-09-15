'use client';

import { useEffect, useRef } from 'react';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { useApiQuery } from '@/hooks/api';
import { prospectsService } from '@/lib/api/services/prospects.service';
import type { FollowUpRange } from '@/lib/crm/followups/types';

export function useFollowUps(
  range: FollowUpRange,
  page = 1,
  pageSize = 25,
  refreshToken = 0,
) {
  const orgScopeKey = useOrgScopeKey();
  const queryKey = [
    'prospects.followups',
    orgScopeKey,
    range,
    page,
    pageSize,
  ].join('.');

  const { refetch, ...result } = useApiQuery(queryKey, () =>
    prospectsService.getFollowUps({ range, page, pageSize }),
  );

  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    if (refreshTokenRef.current === refreshToken) {
      return;
    }

    refreshTokenRef.current = refreshToken;
    void refetch();
  }, [refreshToken, refetch]);

  return { ...result, refetch };
}
