export interface AdminListItem {
  id: string;
  email: string;
  createdAt: string;
}

export interface AdminListResponse {
  admins: AdminListItem[];
}

export interface TenantListItem {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  createdAt: string;
  memberCount: number;
}

export interface TenantListResponse {
  tenants: TenantListItem[];
}

export interface TenantDetailResponse {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  createdAt: string;
  memberCount: number;
}

export interface ImpersonateTenantResponse {
  organizationId: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
}

export type {
  OrgEntitlementsSnapshot,
  OrgModule,
  OrgLimitKey,
  OrgLimitsMap,
  UpdatePlatformEntitlementsInput,
} from '@/lib/org-entitlements/types';

export interface PlatformAuthOAuthProvider {
  provider: 'google' | 'apple';
  enabled: boolean;
  clientId: string | null;
  updatedAt: string;
}

async function platformFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string | string[] };

      if (typeof body.message === 'string') {
        message = body.message;
      } else if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      }
    } catch {
      // keep default message
    }

    throw new Error(message);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text.trim()) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function listAdmins(): Promise<AdminListResponse> {
  return platformFetch<AdminListResponse>('/api/platform/admins');
}

export async function listTenants(): Promise<TenantListResponse> {
  return platformFetch<TenantListResponse>('/api/platform/tenants');
}

export async function getTenant(id: string): Promise<TenantDetailResponse> {
  return platformFetch<TenantDetailResponse>(`/api/platform/tenants/${id}`);
}

export async function startImpersonation(
  organizationId: string,
): Promise<ImpersonateTenantResponse> {
  return platformFetch<ImpersonateTenantResponse>(
    `/api/platform/impersonate/${organizationId}`,
    { method: 'POST' },
  );
}

export async function stopImpersonation(
  organizationId?: string,
): Promise<void> {
  const query = organizationId
    ? `?organizationId=${encodeURIComponent(organizationId)}`
    : '';

  await platformFetch<void>(`/api/platform/impersonate${query}`, {
    method: 'DELETE',
  });
}

export async function getPlatformTenantEntitlements(
  tenantId: string,
): Promise<import('@/lib/org-entitlements/types').OrgEntitlementsSnapshot> {
  return platformFetch(
    `/api/platform/tenants/${tenantId}/entitlements`,
  );
}

export async function updatePlatformTenantEntitlements(
  tenantId: string,
  input: import('@/lib/org-entitlements/types').UpdatePlatformEntitlementsInput,
): Promise<import('@/lib/org-entitlements/types').OrgEntitlementsSnapshot> {
  return platformFetch(`/api/platform/tenants/${tenantId}/entitlements`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function listPlatformAuthOAuthProviders(): Promise<
  PlatformAuthOAuthProvider[]
> {
  return platformFetch<PlatformAuthOAuthProvider[]>('/api/platform/auth-oauth');
}

export async function updatePlatformAuthOAuthProvider(
  provider: 'google' | 'apple',
  input: { enabled?: boolean; clientId?: string | null },
): Promise<PlatformAuthOAuthProvider> {
  return platformFetch<PlatformAuthOAuthProvider>(
    `/api/platform/auth-oauth/${provider}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
}
