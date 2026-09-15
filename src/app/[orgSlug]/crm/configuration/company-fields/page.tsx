import { redirect } from 'next/navigation';

interface CompanyFieldsRedirectPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function CompanyFieldsRedirectPage({
  params,
}: CompanyFieldsRedirectPageProps) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/crm/companies/fields`);
}
