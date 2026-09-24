import { redirect } from 'next/navigation';

interface CrmSettingsRedirectPageProps {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default async function CrmSettingsLocationsEditRedirectPage({
  params,
}: CrmSettingsRedirectPageProps) {
  const { orgSlug, id } = await params;
  redirect(`/${orgSlug}/crm/configuration/locations/${id}`);
}
