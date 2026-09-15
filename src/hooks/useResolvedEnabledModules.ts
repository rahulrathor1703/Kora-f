'use client';

import { useImpersonation } from '@/contexts/impersonation';
import { useApiQuery } from '@/hooks/api';
import { useSession } from '@/hooks/useAuth';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import { getOrganizationEntitlements } from '@/lib/org-entitlements/api';
import type { OrgModule } from '@/lib/org-entitlements/types';

export function useResolvedEnabledModules(): OrgModule[] | undefined {
  const { data: session } = useSession();
  const { organization: impersonatedOrganization } = useImpersonation();

  const enabledModules = session?.organization?.enabledModules;
  const isSuperAdmin = isPlatformOwner(session);
  const shouldLoadEntitlements =
    isSuperAdmin && Boolean(impersonatedOrganization) && !enabledModules;

  const entitlementsQuery = useApiQuery(
    'organization.entitlements',
    () => getOrganizationEntitlements(),
    { enabled: shouldLoadEntitlements },
  );

  return enabledModules ?? entitlementsQuery.data?.enabledModules;
}
