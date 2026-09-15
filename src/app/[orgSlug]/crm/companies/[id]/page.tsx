import CompanyDetailContent from '@/components/crm/companies/detail/CompanyDetailContent';
import CrmHubShell from '@/components/crm/CrmHubShell';

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { id } = await params;

  return (
    <CrmHubShell>
      <CompanyDetailContent companyId={id} />
    </CrmHubShell>
  );
}
