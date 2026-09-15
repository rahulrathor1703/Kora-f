import { redirect } from 'next/navigation';

interface ExcludedPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function ExcludedPage({ params }: ExcludedPageProps) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/email/lists?tab=excluded`);
}
