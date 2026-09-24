import { redirect } from 'next/navigation';
import { CRM_COMPANY_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';

interface ManageCompanyFieldsRedirectPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function ManageCompanyFieldsRedirectPage({
  params,
}: ManageCompanyFieldsRedirectPageProps) {
  const { orgSlug } = await params;
  redirect(
    `/${orgSlug}/settings/forms/${encodeURIComponent(CRM_COMPANY_CREATE_FORM_KEY)}`,
  );
}
