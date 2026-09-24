import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionFormContent from '@/components/email/settings/EmailConfigOptionFormContent';

export default function CreateRegionPage() {
  return (
    <EmailHubShell>
      <EmailConfigOptionFormContent mode="create" category="region" />
    </EmailHubShell>
  );
}
