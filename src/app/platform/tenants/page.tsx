import { cookies } from 'next/headers';
import PlatformOrganizationsContent from '@/components/platform/PlatformOrganizationsContent';
import { env } from '@/config/env';
import type { TenantListItem } from '@/lib/api/platform';

async function fetchInitialTenants(): Promise<{
  tenants: TenantListItem[];
  errorMessage: string | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { tenants: [], errorMessage: 'Unable to load organizations' };
  }

  try {
    const response = await fetch(`${env.backendInternalUrl}/platform/tenants`, {
      headers: {
        Cookie: `access_token=${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { tenants: [], errorMessage: 'Unable to load organizations' };
    }

    const data = (await response.json()) as { tenants: TenantListItem[] };
    return { tenants: data.tenants, errorMessage: null };
  } catch {
    return { tenants: [], errorMessage: 'Unable to load organizations' };
  }
}

export default async function PlatformTenantsPage() {
  const { tenants, errorMessage } = await fetchInitialTenants();

  return (
    <PlatformOrganizationsContent
      initialTenants={tenants}
      initialErrorMessage={errorMessage}
    />
  );
}
