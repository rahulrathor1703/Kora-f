import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionFormContent from '@/components/email/settings/EmailConfigOptionFormContent';

export default function CreateCampaignTypePage() {
  return (
    <EmailHubShell>
      <EmailConfigOptionFormContent mode="create" category="campaign-type" />
    </EmailHubShell>
  );
}
