import { redirect } from 'next/navigation';
import { orgPath } from '@/lib/org-path';

interface WebsitePageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WebsitePage({ params }: WebsitePageProps) {
  const { orgSlug } = await params;
  redirect(orgPath(orgSlug, '/website/overview'));
}
