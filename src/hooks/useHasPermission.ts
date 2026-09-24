'use client';

import { useSession } from '@/hooks/useAuth';
import {
  hasAnyPermission as checkAnyPermission,
  hasPermission as checkPermission,
} from '@/lib/api/types/auth.types';

export function useHasPermission(permission: string): boolean {
  const { data: session } = useSession();
  return checkPermission(session, permission);
}

export function useHasAnyPermission(permissions: string[]): boolean {
  const { data: session } = useSession();
  return checkAnyPermission(session, permissions);
}
