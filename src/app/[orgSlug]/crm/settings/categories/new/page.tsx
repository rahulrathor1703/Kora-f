import { redirect } from 'next/navigation';

interface CrmSettingsRedirectPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function CrmSettingsCategoriesNewRedirectPage({
  params,
}: CrmSettingsRedirectPageProps) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/crm/configuration/categories/new`);
}
