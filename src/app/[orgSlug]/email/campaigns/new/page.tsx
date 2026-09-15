import CampaignWizardShell from '@/components/email/campaigns/create/CampaignWizardShell';
import EmailHubShell from '@/components/email/EmailHubShell';

export default function NewCampaignPage() {
  return (
    <EmailHubShell hideHeader>
      <CampaignWizardShell />
    </EmailHubShell>
  );
}
