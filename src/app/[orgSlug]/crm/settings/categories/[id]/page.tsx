import { redirect } from 'next/navigation';

interface CrmSettingsRedirectPageProps {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default async function CrmSettingsCategoriesEditRedirectPage({
  params,
}: CrmSettingsRedirectPageProps) {
  const { orgSlug, id } = await params;
  redirect(`/${orgSlug}/crm/configuration/categories/${id}`);
}
