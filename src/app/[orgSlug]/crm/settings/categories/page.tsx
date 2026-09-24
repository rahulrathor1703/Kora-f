import { redirect } from 'next/navigation';

interface CrmSettingsRedirectPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function CrmSettingsCategoriesRedirectPage({
  params,
}: CrmSettingsRedirectPageProps) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/crm/configuration/categories`);
}
