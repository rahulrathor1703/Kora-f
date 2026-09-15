import CampaignDetailContent from '@/components/email/campaigns/detail/CampaignDetailContent';
import EmailHubShell from '@/components/email/EmailHubShell';

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id } = await params;

  return (
    <EmailHubShell hideHeader>
      <CampaignDetailContent campaignId={id} />
    </EmailHubShell>
  );
}
