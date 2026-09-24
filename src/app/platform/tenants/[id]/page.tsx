import PlatformTenantEntitlementsContent from '@/components/platform/PlatformTenantEntitlementsContent';

interface PlatformTenantPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlatformTenantPage({ params }: PlatformTenantPageProps) {
  const { id } = await params;

  return <PlatformTenantEntitlementsContent tenantId={id} />;
}
