import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionFormContent from '@/components/email/settings/EmailConfigOptionFormContent';

interface EditCampaignTypePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignTypePage({
  params,
}: EditCampaignTypePageProps) {
  const { id } = await params;

  return (
    <EmailHubShell>
      <EmailConfigOptionFormContent
        mode="edit"
        category="campaign-type"
        optionId={id}
      />
    </EmailHubShell>
  );
}
