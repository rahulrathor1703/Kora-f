import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionsListContent from '@/components/email/settings/EmailConfigOptionsListContent';

export default function RegionsSettingsPage() {
  return (
    <EmailHubShell>
      <EmailConfigOptionsListContent category="region" />
    </EmailHubShell>
  );
}
