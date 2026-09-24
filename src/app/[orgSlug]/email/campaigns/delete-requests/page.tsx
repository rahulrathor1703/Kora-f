import { redirect } from 'next/navigation';

interface CampaignDeleteRequestsRedirectPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function CampaignDeleteRequestsRedirectPage({
  params,
}: CampaignDeleteRequestsRedirectPageProps) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/email/settings/delete-requests`);
}
