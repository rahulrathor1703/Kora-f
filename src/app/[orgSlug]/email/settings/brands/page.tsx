import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionsListContent from '@/components/email/settings/EmailConfigOptionsListContent';

export default function BrandsSettingsPage() {
  return (
    <EmailHubShell>
      <EmailConfigOptionsListContent category="brand" />
    </EmailHubShell>
  );
}
