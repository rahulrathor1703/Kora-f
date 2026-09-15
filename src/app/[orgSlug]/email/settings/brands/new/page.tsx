import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionFormContent from '@/components/email/settings/EmailConfigOptionFormContent';

export default function CreateBrandPage() {
  return (
    <EmailHubShell>
      <EmailConfigOptionFormContent mode="create" category="brand" />
    </EmailHubShell>
  );
}
