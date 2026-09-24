import EditCampaignPageContent from '@/components/email/campaigns/create/EditCampaignPageContent';
import EmailHubShell from '@/components/email/EmailHubShell';

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params;

  return (
    <EmailHubShell hideHeader>
      <EditCampaignPageContent campaignId={id} />
    </EmailHubShell>
  );
}
