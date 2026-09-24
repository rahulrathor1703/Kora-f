import { redirect } from 'next/navigation';
import { orgPath } from '@/lib/org-path';

interface EmailPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function EmailPage({ params }: EmailPageProps) {
  const { orgSlug } = await params;
  redirect(orgPath(orgSlug, '/email/campaigns'));
}
