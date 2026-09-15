import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';
import OrgFormEditorContent from '@/components/settings/forms/OrgFormEditorContent';
import { hasPermission } from '@/lib/api/types/auth.types';
import { getSession } from '@/lib/auth/session';

interface OrgFormEditorPageProps {
  params: Promise<{ orgSlug: string; formKey: string }>;
}

export default async function OrgFormEditorPage({ params }: OrgFormEditorPageProps) {
  const { orgSlug, formKey } = await params;
  const session = await getSession();

  if (!hasPermission(session, 'forms:read')) {
    redirect(`/${orgSlug}/settings`);
  }

  return (
    <DashboardContent>
      <OrgFormEditorContent formKey={decodeURIComponent(formKey)} />
    </DashboardContent>
  );
}
