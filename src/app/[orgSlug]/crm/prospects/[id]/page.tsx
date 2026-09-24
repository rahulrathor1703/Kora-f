import ProspectDetailContent from '@/components/crm/prospects/detail/ProspectDetailContent';
import CrmHubShell from '@/components/crm/CrmHubShell';

interface ProspectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProspectDetailPage({
  params,
}: ProspectDetailPageProps) {
  const { id } = await params;

  return (
    <CrmHubShell hideHeader>
      <ProspectDetailContent prospectId={id} />
    </CrmHubShell>
  );
}
