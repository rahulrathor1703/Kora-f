import { redirect } from 'next/navigation';
import { CRM_PROSPECT_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
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

  redirect(
    `/${orgSlug}/settings/forms/${encodeURIComponent(CRM_PROSPECT_CREATE_FORM_KEY)}`,
  );
}
