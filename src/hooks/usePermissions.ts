'use client';

import { roleService } from '@/lib/api';
import { useApiQuery } from '@/hooks/api';

export function usePermissions() {
  return useApiQuery('permissions.list', () => roleService.getPermissions());
}
