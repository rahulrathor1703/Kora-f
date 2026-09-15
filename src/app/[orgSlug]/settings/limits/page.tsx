import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';
import OrgModuleLimitsContent from '@/components/settings/limits/OrgModuleLimitsContent';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import { getSession } from '@/lib/auth/session';

interface OrgModuleLimitsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgModuleLimitsPage({
  params,
}: OrgModuleLimitsPageProps) {
  const { orgSlug } = await params;
  const session = await getSession();

  if (!isPlatformOwner(session)) {
    redirect(`/${orgSlug}/settings`);
  }

  return (
    <DashboardContent>
      <OrgModuleLimitsContent />
    </DashboardContent>
  );
}
