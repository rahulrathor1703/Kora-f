import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';
import OrgFormEditorContent from '@/components/settings/forms/OrgFormEditorContent';
import { hasPermission } from '@/lib/api/types/auth.types';
import { getSession } from '@/lib/auth/session';
import {
  CRM_PROSPECT_CREATE_FORM_KEY,
  isManageableFormKey,
} from '@/lib/forms/crm-form-keys';

interface OrgFormEditorPageProps {
  params: Promise<{ orgSlug: string; formKey: string }>;
}

export default async function OrgFormEditorPage({ params }: OrgFormEditorPageProps) {
  const { orgSlug, formKey } = await params;
  const session = await getSession();

  if (!hasPermission(session, 'forms:read')) {
    redirect(`/${orgSlug}/settings`);
  }

  const decodedFormKey = decodeURIComponent(formKey);
  if (!isManageableFormKey(decodedFormKey)) {
    redirect(
      `/${orgSlug}/settings/forms/${encodeURIComponent(CRM_PROSPECT_CREATE_FORM_KEY)}`,
    );
  }

  return (
    <DashboardContent>
      <OrgFormEditorContent formKey={decodedFormKey} />
    </DashboardContent>
  );
}
