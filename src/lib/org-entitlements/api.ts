import { apiClient } from '@/lib/api/client';
import type {
  OrgEntitlementsSnapshot,
  UpdateOrgLimitsInput,
  UpdatePlatformEntitlementsInput,
} from './types';

export async function getOrganizationEntitlements(): Promise<OrgEntitlementsSnapshot> {
  return apiClient.get<OrgEntitlementsSnapshot>('/organization/entitlements');
}

export async function updateOrganizationLimits(
  input: UpdateOrgLimitsInput,
): Promise<OrgEntitlementsSnapshot> {
  return apiClient.put<OrgEntitlementsSnapshot>('/organization/limits', input);
}

export async function getPlatformTenantEntitlements(
  tenantId: string,
): Promise<OrgEntitlementsSnapshot> {
  return apiClient.get<OrgEntitlementsSnapshot>(
    `/platform/tenants/${tenantId}/entitlements`,
  );
}

export async function updatePlatformTenantEntitlements(
  tenantId: string,
  input: UpdatePlatformEntitlementsInput,
): Promise<OrgEntitlementsSnapshot> {
  return apiClient.patch<OrgEntitlementsSnapshot>(
    `/platform/tenants/${tenantId}/entitlements`,
    input,
  );
}
