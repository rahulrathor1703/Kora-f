import { redirect } from 'next/navigation';
import { CRM_PROSPECT_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';

interface ManageProspectFieldsRedirectPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function ManageProspectFieldsRedirectPage({
  params,
}: ManageProspectFieldsRedirectPageProps) {
  const { orgSlug } = await params;
  redirect(
    `/${orgSlug}/settings/forms/${encodeURIComponent(CRM_PROSPECT_CREATE_FORM_KEY)}`,
  );
}
