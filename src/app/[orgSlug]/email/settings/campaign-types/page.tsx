import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionsListContent from '@/components/email/settings/EmailConfigOptionsListContent';

export default function CampaignTypesSettingsPage() {
  return (
    <EmailHubShell>
      <EmailConfigOptionsListContent category="campaign-type" />
    </EmailHubShell>
  );
}
