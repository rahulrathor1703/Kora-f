import { redirect } from 'next/navigation';

interface EmailReportsRedirectPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function EmailReportsRedirectPage({
  params,
}: EmailReportsRedirectPageProps) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/email/settings/delete-requests`);
}
