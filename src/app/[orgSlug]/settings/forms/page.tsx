import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';
import OrgFormsSettingsContent from '@/components/settings/forms/OrgFormsSettingsContent';
import { hasPermission } from '@/lib/api/types/auth.types';
import { getSession } from '@/lib/auth/session';

interface OrgFormsSettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgFormsSettingsPage({
  params,
}: OrgFormsSettingsPageProps) {
  const { orgSlug } = await params;
  const session = await getSession();

  if (!hasPermission(session, 'forms:read')) {
    redirect(`/${orgSlug}/settings`);
  }

  return (
    <DashboardContent>
      <OrgFormsSettingsContent />
    </DashboardContent>
  );
}
