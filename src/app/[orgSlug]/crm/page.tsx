import { redirect } from 'next/navigation';
import { orgPath } from '@/lib/org-path';

interface CrmPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function CrmPage({ params }: CrmPageProps) {
  const { orgSlug } = await params;
  redirect(orgPath(orgSlug, '/crm/prospectus'));
}
